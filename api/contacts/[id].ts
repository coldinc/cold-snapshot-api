import axios from "axios";

const idContactsHandler = async (req: any, res: any) => {
  const baseId = process.env.AIRTABLE_BASE_ID || "";
  const contactsTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME || "";
  const airtableToken = process.env.AIRTABLE_TOKEN || "";

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    },
  };

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(contactsTable)}/${id}`;

  try {
    if (req.method === "GET") {
      const response = await axios.get(recordUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === "PATCH") {
      const response = await axios.patch(
        recordUrl,
        { fields: req.body },
        config,
      );
      return res.status(200).json(response.data);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    const err = error as any;
    console.error("API error:", {
      message: err.message,
      config: err.config,
      response: err.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = idContactsHandler;
