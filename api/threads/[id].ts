const Airtable = require("airtable");
const {
  getFieldMap,
  filterMappedFields,
} = require("../../lib/resolveFieldMap");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const threadByIdHandler = async (req: any, res: any) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const record = await base("Threads").find(id);
      return res.status(200).json({ id: record.id, ...record.fields });
    }

    if (req.method === "PATCH") {
      const updatePayload = Object.entries(req.body).reduce((acc: any, [key, value]) => {
        const fieldId = fieldMap["Threads"][key];
        if (fieldId) acc[fieldId] = value;
        return acc;
      }, {});

      const updated = await base("Threads").update(id, { fields: updatePayload });
      return res.status(200).json({ id: updated.id, ...updated.fields });
    }

    if (req.method === "DELETE") {
      await base("Threads").destroy(id);
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = threadByIdHandler;
