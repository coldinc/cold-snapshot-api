# 🧠 `synthesisEndpoints.md`

This document explains how to use the API routes that generate synthesis data and how they connect to GPT.

---

## 📋 Available Endpoints

### `GET /api/snapshots-synthesize-current-state`

Returns the most recent snapshot from Airtable with fields mapped using `resolveFieldMap`. Use this to give GPT an up‑to‑date view of the project state.

```bash
curl https://your-domain.com/api/snapshots-synthesize-current-state
```

A successful response is a JSON object containing the snapshot fields. If no snapshots exist, the endpoint responds with `404`.

### `POST /api/synthesize-thread`

Generates a narrative summary for a thread using GPT.

```bash
curl -X POST https://your-domain.com/api/synthesize-thread \
  -H "Content-Type: application/json" \
  -d '{"threadId":"recXXXXXXXXXXXXXX"}'
```

Steps performed:

1. Fetch the thread record, related logs and contacts.
2. Build a prompt via `buildSynthesisPrompt`.
3. Call the OpenAI API using `runGPTSynthesis`.
4. Store the GPT response as a new log entry.
5. Return `{ synthesis, synthesisLog }`.

If `threadId` is missing the route returns `400`. Any upstream errors propagate their status codes.

---

## ⚙️ GPT Integration

`synthesize-thread` requires an `OPENAI_API_KEY` environment variable. The endpoint sends prompts to GPT‑4 and returns the generated summary so it can be surfaced in the application or further processed by other actions.

`snapshots-synthesize-current-state` does not contact GPT directly but is typically used as input for subsequent GPT calls.
