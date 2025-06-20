import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { synthesizeThreadNarrative } from "./synthesisUtils.js";


const apiSynthesizeThreadHandler = async (req: any, res: any) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  try {
    const { threadId } = req.body;

    if (!threadId) {
      return res.status(400).json({ error: "Missing threadId" });
    }

    // 1. Fetch thread record
    let threadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/${threadId}`;
    const threadRes = await fetch(threadUrl, { method: "GET" });
    if (!threadRes.ok) {
      return res.status(threadRes.status).json({ error: await threadRes.text() });
    }
    const thread = await threadRes.json();

    // 2. Fetch logs linked to this thread
    console.log("Fetching logs from:", `${process.env.NEXT_PUBLIC_BASE_URL}/api/log-entries/search`);

    let logsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/log-entries/search`;
    logsUrl += `?${new URLSearchParams({ threadId }).toString()}`;
    const logsRes = await fetch(logsUrl, { method: "GET" });
    if (!logsRes.ok) {
      return res.status(logsRes.status).json({ error: await logsRes.text() });
    }
    const logs = await logsRes.json();

    // 3. Fetch contacts linked to this thread
    let contactsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/contacts/search`;
    contactsUrl += `?${new URLSearchParams({ threadId }).toString()}`;
    const contactsRes = await fetch(contactsUrl, { method: "GET" });
    if (!contactsRes.ok) {
      return res.status(contactsRes.status).json({ error: await contactsRes.text() });
    }
    const contacts = await contactsRes.json();

    // 4. Build synthesis prompt and run GPT
    const prompt = buildSynthesisPrompt({ thread, logs, contacts });
    const synthesis = await runGPTSynthesis(prompt);

    // 5. Store synthesis output as a new log
    const createRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/log-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          Summary: `Synthesis for Thread: ${thread.fields?.Title || threadId}`,
          Content: synthesis,
          "Log Type": "Synthesis",
          Threads: [threadId],
          Contacts: contacts.map((c: any) => c.id)
        }
      })
    });
    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: await createRes.text() });
    }
    const createData = await createRes.json();

    return res.status(200).json({
      synthesis,
      synthesisLog: createData
    });
  } catch (error) {
    console.error("Synthesis failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default apiSynthesizeThreadHandler;
