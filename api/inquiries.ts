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

  let rawBodyBuffer: Buffer;
  try {
    rawBodyBuffer = await getRawBody(req);
  } catch (error: any) {
    console.error("[inquiries] failed to read raw body", {
      message: error?.message,
    });
    return res
      .status(400)
      .json({ status: "error", error: "Invalid request body" });
  }

  const rawBodyString = rawBodyBuffer.toString("utf8");

  const secret = process.env.INQUIRIES_SECRET;
  const framerSignatureHeader = req.headers["framer-signature"];
  const submissionIdHeader = req.headers["framer-webhook-submission-id"];
  const framerSignature = Array.isArray(framerSignatureHeader)
    ? framerSignatureHeader[0]
    : framerSignatureHeader;
  const submissionId = Array.isArray(submissionIdHeader)
    ? submissionIdHeader[0]
    : submissionIdHeader;

  if (!secret || !framerSignature || !submissionId) {
    return res.status(403).json({ status: "error", error: "Unauthorized" });
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBodyBuffer);
  hmac.update(submissionId);
  const expectedSignature = "sha256=" + hmac.digest("hex");

  const providedBuffer = Buffer.from(framerSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return res.status(403).json({ status: "error", error: "Invalid signature" });
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
    let fieldKey: keyof InquiryPayload | null = null;

    switch (normalizedKey) {
      case "name":
        fieldKey = "name";
        break;
      case "email":
        fieldKey = "email";
        break;
      case "company":
        fieldKey = "company";
        break;
      case "message":
        fieldKey = "message";
        break;
      case "source":
        fieldKey = "source";
        break;
      case "sourcedetail":
        fieldKey = "sourceDetail";
        break;
      default:
        fieldKey = null;
    }

    if (!fieldKey) continue;

    const normalizedValue = value === null ? undefined : value;

    if (normalizedValue === undefined) {
      normalizedPayload[fieldKey] = undefined;
      continue;
    }

    if (
      typeof normalizedValue === "object" ||
      typeof normalizedValue === "function"
    ) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid payload value" });
    }

    normalizedPayload[fieldKey] = String(normalizedValue);
  }

  const emailValue = normalizedPayload.email;

  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: "error", error: "Valid email is required" });
  }

  const rawName = typeof normalizedPayload.name === "string" ? normalizedPayload.name : undefined;
  const rawCompany =
    typeof normalizedPayload.company === "string" ? normalizedPayload.company : undefined;
  const rawMessage =
    typeof normalizedPayload.message === "string" ? normalizedPayload.message : undefined;
  const rawSource =
    typeof normalizedPayload.source === "string" ? normalizedPayload.source : undefined;
  const rawSourceDetail =
    typeof normalizedPayload.sourceDetail === "string"
      ? normalizedPayload.sourceDetail
      : undefined;

  const name = rawName?.trim() || undefined;
  const company = rawCompany?.trim() || undefined;
  const message = rawMessage?.trim() || undefined;
  const source = rawSource?.trim() || undefined;
  const sourceDetail = rawSourceDetail?.trim() || "Website Inquiry";

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
