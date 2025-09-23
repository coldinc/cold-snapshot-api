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

  const payload = req.body as InquiryPayload | undefined;

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ status: "error", error: "Invalid payload" });
  }

  const { name, email, company, message, source } = payload;

  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ status: "error", error: "Email is required" });
  }

  if (message !== undefined && typeof message !== "string") {
    return res.status(400).json({ status: "error", error: "Message must be a string" });
  }

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ status: "error", error: "Name must be a string" });
  }

  if (company !== undefined && typeof company !== "string") {
    return res.status(400).json({ status: "error", error: "Company must be a string" });
  }

  if (source !== undefined && typeof source !== "string") {
    return res.status(400).json({ status: "error", error: "Source must be a string" });
  }

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

      const contactData = mapInternalToAirtable(contactInput, contactFieldMap);

      const [createdContact] = await base(contactsTable).create([
        { fields: contactData },
      ]);

      contactId = createdContact.id;
    }

    const logSummaryName = name?.trim() || email.trim();
    const logInput: Record<string, any> = {
      summary: `Inbound inquiry from ${logSummaryName}`,
      content: message ?? "",
      logType: "Inquiry",
      linkedContacts: [contactId],
      linkedThreads: [inboundThreadId],
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
