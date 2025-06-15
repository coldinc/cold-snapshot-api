const apiSynthesizeThreadHandler = async (req: any, res: any) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const axios = require("axios");
  const getAirtableContext = require("../lib/airtableBase");
  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  const { getFieldMap } = require("../lib/resolveFieldMap");
  const { buildSynthesisPrompt, runGPTSynthesis } = require("../lib/synthesisUtils");

  try {
    const { threadId } = req.body;

    if (!threadId) {
      return res.status(400).json({ error: "Missing threadId" });
    }

    // 1. Fetch thread record
    const threadRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/${threadId}`);
    const thread = threadRes.data;

    // 2. Fetch logs linked to this thread
    const logsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/log-entries/search`, {
      params: { threadId }
    });
    const logs = logsRes.data;

    // 3. Fetch contacts linked to this thread
    const contactsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contacts/search`, {
      params: { threadId }
    });
    const contacts = contactsRes.data;

    // 4. Build synthesis prompt and run GPT
    const prompt = buildSynthesisPrompt({ thread, logs, contacts });
    const synthesis = await runGPTSynthesis(prompt);

    // 5. Store synthesis output as a new log
    const createRes = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/log-entries`, {
      fields: {
        Summary: `Synthesis for Thread: ${thread.fields?.Title || threadId}`,
        Content: synthesis,
        "Log Type": "Synthesis",
        Threads: [threadId],
        Contacts: contacts.map((c: any) => c.id)
      }
    });

    return res.status(200).json({
      synthesis,
      synthesisLog: createRes.data
    });
  } catch (error) {
    console.error("Synthesis failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = apiSynthesizeThreadHandler;
