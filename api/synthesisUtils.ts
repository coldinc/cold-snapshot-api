import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { FieldSet, Record as AirtableRecord } from "airtable";
import OpenAI from "openai";

export async function synthesizeThreadNarrative(threadId: string) {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    // Get field mappings
    const logFieldMap = await getFieldMap(TABLES.LOGS);

    // Fetch all logs linked to the given thread
    const logRecords = await base(TABLES.LOGS)
        .select({
            filterByFormula: `FIND("${threadId}", ARRAYJOIN({${logFieldMap.linkedThreads}}))`,
            fields: [logFieldMap.content],
            sort: [{ field: logFieldMap.date, direction: "asc" }]
        })
        .all();

    const logContentArray = logRecords
        .map((record: any) => record.fields?.[logFieldMap.content])
        .filter(Boolean);

    const logContent = logContentArray.join("\n\n").trim();

    if (!logContent) {
        return {
            summary: "No relevant logs were found for this thread.",
            recommendations: []
        };
    }

    // Construct the system/user messages for GPT
    const messages = [
        {
            role: "system",
            content:
                "You are an insightful assistant helping synthesize threads of work based on project logs. Provide a narrative summary and recommendations."
        },
        {
            role: "user",
            content: `Here is a set of logs related to a thread of work:\n\n${logContent}\n\nPlease synthesize the main narrative and offer any useful recommendations or observations.`
        }
    ];

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages
    });

    const result = chatCompletion.choices[0].message.content;

    return {
        summary: result,
        recommendations: [] // Expand if needed later
    };
}

interface SynthesisInput {
    thread: any;
    logs: any[];
    contacts: any[];
}

export function buildSynthesisPrompt({ thread, logs, contacts }: SynthesisInput) {
    const title = thread.fields?.Name || thread.fields?.Title || thread.id;
    const description = thread.fields?.Description || "";

    const logSections = logs
        .map((log: any, idx: number) => {
            const summary = log.fields?.Summary || "";
            const content = log.fields?.Content || "";
            return `Log ${idx + 1}: ${summary}\n${content}`.trim();
        })
        .join("\n\n");

    const contactList = contacts
        .map((c: any) => {
            const name = c.fields?.Name || c.id;
            const role = c.fields?.Role ? `, ${c.fields.Role}` : "";
            const company = c.fields?.Company ? ` at ${c.fields.Company}` : "";
            return `${name}${role}${company}`.trim();
        })
        .join("; ");

    const userPrompt = [
        `Thread Title: ${title}`,
        description && `Description: ${description}`,
        contactList && `Contacts: ${contactList}`,
        logSections && `Logs:\n${logSections}`,
    ]
        .filter(Boolean)
        .join("\n\n");

    return {
        systemPrompt:
            "You are an assistant that summarizes project threads based on their metadata, related logs and contacts.",
        userPrompt:
            `${userPrompt}\n\nProvide a concise narrative summary of this thread and any useful recommendations.`,
    };
}

export async function runGPTSynthesis(prompt: {
    systemPrompt: string;
    userPrompt: string;
}) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                { role: "system", content: prompt.systemPrompt },
                { role: "user", content: prompt.userPrompt },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
}
