async function synthesizeThreadNarrative(threadId: string) {
  const { base, TABLES } = require("../lib/airtableBase");
  const { getFieldMap } = require("../lib/resolveFieldMap");
  const OpenAI = require("openai");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Get field mappings
  const logFieldMap = await getFieldMap(TABLES.LOGS);

  // Fetch all logs linked to the given thread
  const logRecords = await base(TABLES.LOGS)
    .select({
      filterByFormula: `FIND("${threadId}", ARRAYJOIN(${logFieldMap["Thread (Linked)"]}))`,
      fields: [logFieldMap["Content"]],
      sort: [{ field: logFieldMap["Date"], direction: "asc" }],
    })
    .all();

  const logContentArray = logRecords
    .map((record: any) => record.fields?.[logFieldMap["Content"]])
    .filter(Boolean);

  const logContent = logContentArray.join("\n\n").trim();

  if (!logContent) {
    return {
      summary: "No relevant logs were found for this thread.",
      recommendations: [],
    };
  }

  // Construct the system/user messages for GPT
  const messages = [
    {
      role: "system",
      content:
        "You are an insightful assistant helping synthesize threads of work based on project logs. Provide a narrative summary and recommendations.",
    },
    {
      role: "user",
      content: `Here is a set of logs related to a thread of work:\n\n${logContent}\n\nPlease synthesize the main narrative and offer any useful recommendations or observations.`,
    },
  ];

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
  });

  const result = chatCompletion.choices[0].message.content;

  return {
    summary: result,
    recommendations: [], // Expand if needed later
  };
}

module.exports = {
  synthesizeThreadNarrative,
};
