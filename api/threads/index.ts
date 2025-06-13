const Airtable = require("airtable");
const fieldMap = require("../../utils/fieldMap");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const threadsHandler = async (req: any, res: any) => {
  try {
    if (req.method === "GET") {
      const records = await base("Threads").select({}).all();
      const threads = records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
      return res.status(200).json({ records: threads });
    }

    if (req.method === "POST") {
      const data = req.body;
      const createPayload = Object.entries(data).reduce((acc: any, [key, value]) => {
        const fieldId = fieldMap["Threads"][key];
        if (fieldId) acc[fieldId] = value;
        return acc;
      }, {});

      const created = await base("Threads").create([{ fields: createPayload }]);
      return res.status(201).json({ id: created[0].id, ...created[0].fields });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = threadsHandler;
