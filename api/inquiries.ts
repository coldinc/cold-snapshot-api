import crypto from "node:crypto";

import getRawBody from "raw-body";

import { airtableSearch } from "./airtableSearch.js";
import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";

interface InquiryPayload {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  source?: string;
  sourceDetail?: string;
}

interface InquiryResponse {
  contactId?: string;
  logId?: string;
  status: "success" | "error";
  error?: string;
}

const inquiriesHandler = async (req: any, res: any) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const inboundThreadId = process.env.AIRTABLE_INBOUND_THREAD_ID;
  if (!inboundThreadId) {
    return res
      .status(500)
      .json({ status: "error", error: "Missing inbound thread configuration" });
  }

  let rawBodyString: string | undefined;

  try {
    rawBodyString = await getRawBody(req, {
      encoding: "utf8",
    });
  } catch (error: any) {
    console.error("[inquiries] failed to read raw body", {
      message: error?.message,
    });
    return res
      .status(400)
      .json({ status: "error", error: "Invalid request payload" });
  }

  const secret = process.env.INQUIRIES_SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ status: "error", error: "Missing inquiries secret configuration" });
  }

  const framerSignatureHeader = req.headers["framer-signature"];
  const submissionIdHeader = req.headers["framer-webhook-submission-id"];
  const framerSignature = Array.isArray(framerSignatureHeader)
    ? framerSignatureHeader[0]
    : framerSignatureHeader;
  const submissionId = Array.isArray(submissionIdHeader)
    ? submissionIdHeader[0]
    : submissionIdHeader;

  if (
    !framerSignature ||
    typeof framerSignature !== "string" ||
    !submissionId ||
    typeof submissionId !== "string" ||
    !rawBodyString
  ) {
    return res.status(403).json({ status: "error", error: "Unauthorized" });
  }

  const payloadToSign = rawBodyString + submissionId + secret;
  const computed = crypto.createHmac("sha256", secret).update(payloadToSign).digest("hex");
  const expectedSignature = `sha256=${computed}`;
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(framerSignature, "utf8");

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return res.status(403).json({ status: "error", error: "Unauthorized" });
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBodyString);
  } catch {
    return res
      .status(400)
      .json({ status: "error", error: "Invalid JSON payload" });
  }

  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    return res
      .status(400)
      .json({ status: "error", error: "Invalid payload format" });
  }

  const normalizedPayload: Partial<InquiryPayload> = {};

  for (const [key, value] of Object.entries(parsedBody as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase();
    const normalizedValue = value === null ? undefined : value;

    switch (normalizedKey) {
      case "name":
      case "email":
      case "company":
      case "message":
        normalizedPayload[normalizedKey as keyof InquiryPayload] = normalizedValue as
          | string
          | undefined;
        break;
      case "source":
        normalizedPayload.source = normalizedValue as string | undefined;
        break;
      case "sourcedetail":
        normalizedPayload.sourceDetail = normalizedValue as string | undefined;
        break;
      default:
        break;
    }
  }

  const emailValue = normalizedPayload.email;

  if (typeof emailValue !== "string" || !emailValue.trim()) {
    return res
      .status(400)
      .json({ status: "error", error: "Email is required" });
  }

  const rawName = normalizedPayload.name;
  if (rawName !== undefined && typeof rawName !== "string") {
    return res.status(400).json({ status: "error", error: "Name must be a string" });
  }

  const rawCompany = normalizedPayload.company;
  if (rawCompany !== undefined && typeof rawCompany !== "string") {
    return res.status(400).json({ status: "error", error: "Company must be a string" });
  }

  const rawMessage = normalizedPayload.message;
  if (rawMessage !== undefined && typeof rawMessage !== "string") {
    return res.status(400).json({ status: "error", error: "Message must be a string" });
  }

  const rawSource = normalizedPayload.source;
  if (rawSource !== undefined && typeof rawSource !== "string") {
    return res.status(400).json({ status: "error", error: "Source must be a string" });
  }

  const rawSourceDetail = normalizedPayload.sourceDetail;
  if (rawSourceDetail !== undefined && typeof rawSourceDetail !== "string") {
    return res
      .status(400)
      .json({ status: "error", error: "Source detail must be a string" });
  }

  const email = emailValue;
  const name = rawName as string | undefined;
  const company = rawCompany as string | undefined;
  const message = rawMessage as string | undefined;
  const source = rawSource as string | undefined;
  const sourceDetail =
    typeof rawSourceDetail === "string" && rawSourceDetail.trim()
      ? rawSourceDetail.trim()
      : "Website Inquiry";

  try {
    const { base, TABLES } = getAirtableContext();
    const contactsTable = TABLES.CONTACTS;
    const logsTable = TABLES.LOGS;

    const contactFieldMap = getFieldMap(contactsTable);
    const logFieldMap = getFieldMap(logsTable);

    const emailFieldName = contactFieldMap.email || "Email";
    const normalizedEmail = email.trim().toLowerCase();
    const escapedEmail = normalizedEmail.replace(/"/g, '\\"');
    const filterFormula = `LOWER({${emailFieldName}}) = "${escapedEmail}"`;

    const { records: existingContacts } = await airtableSearch(
      contactsTable,
      filterFormula,
      { maxRecords: 1 },
    );

    let contactId: string;

    if (existingContacts && existingContacts.length > 0) {
      contactId = existingContacts[0].id;
    } else {
      const contactInput: Record<string, any> = {};
      if (name?.trim()) contactInput.name = name.trim();
      contactInput.email = email.trim();
      if (company?.trim()) contactInput.company = company.trim();
      if (source?.trim()) contactInput.source = source.trim();
      contactInput.sourceDetail = sourceDetail;
      contactInput.followupNeeded = true;

      const contactData = mapInternalToAirtable(contactInput, contactFieldMap);

      const [createdContact] = await base(contactsTable).create([
        { fields: contactData },
      ]);

      contactId = createdContact.id;
    }

    const logSummaryName = name?.trim() || email.trim();
    const summaryText = `Inbound inquiry from ${logSummaryName}`;
    const logInput: Record<string, any> = {
      summary: summaryText,
      name: summaryText,
      content: message ?? "",
      logType: "Inquiry",
      linkedContacts: [contactId],
      linkedThreads: [inboundThreadId],
      date: new Date().toISOString(),
      followupNeeded: true,
    };

    const logData = mapInternalToAirtable(logInput, logFieldMap);

    const [createdLog] = await base(logsTable).create([
      { fields: logData },
    ]);

    return res.status(200).json({
      status: "success",
      contactId,
      logId: createdLog.id,
    });
  } catch (error: any) {
    console.error("[inquiries] handler error", {
      message: error?.message,
      stack: error?.stack,
    });
    return res
      .status(500)
      .json({ status: "error", error: "Failed to process inquiry" });
  }
};

export default inquiriesHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
