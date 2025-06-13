import axios from "axios";

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const logsTableName = process.env.AIRTABLE_LOGS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

const logsIdHandler = async (req: any, res: any) => {
  const { id } = req.query;
  const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(logsTableName!)}/${id}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    if (req.method === "GET") {
      const response = await axios.get(airtableUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === "PATCH") {
      const response = await axios.patch(
        airtableUrl,
        { fields: req.body },
        config,
      );
      return res.status(200).json(response.data);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = logsIdHandler;
