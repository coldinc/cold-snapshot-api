/** @type {(req: any, res: any) => Promise<void>} */
const contactsHandler = async (req: any, res: any) => {
  const Airtable = require("airtable");
  const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  const TABLE_NAME = "Contacts";

  if (req.method === "POST") {
    try {
      const logicalInput: { [key: string]: any } = req.body;
      const contactsMap: { [key: string]: string } = getFieldMap("Contacts");
      const mappedFields = filterMappedFields(logicalInput, "Contacts");

      if (!mappedFields[contactsMap["Name"]]) {
        return res.status(400).json({ error: "Missing required field: Name" });
      }

      const createdRecords = await base(TABLE_NAME).create([{ fields: mappedFields }]);

      return res.status(201).json({
        message: "Contact created successfully",
        id: createdRecords[0].id
      });
    } catch (error: any) {
      console.error("[Contacts POST Error]", error);
      return res.status(500).json({ error: "Failed to create contact" });
    }
  }

  if (req.method === "GET") {
    try {
      const records: any[] = await base(TABLE_NAME).select().all();

      const contacts = records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json(contacts);
    } catch (error: any) {
      console.error("[Contacts GET Error]", error);
      return res.status(500).json({ error: "Failed to fetch contacts" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = contactsHandler;