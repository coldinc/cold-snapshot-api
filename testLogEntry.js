import fetch from "node-fetch"; // install with: npm install node-fetch@2

async function testLogEntry() {
  const url = "http://localhost:3000/api/logEntries"; // adjust if your local dev server runs on a different port

  const payload = {
    summary: "Local debug test",
    logType: "Note",
    date: "2025-09-14",
    content: "Testing scrub locally",
    linkedContactsId: ["recFake123"],   // invalid synthetic field
    lastModified: "2025-09-14T00:00:00.000Z" // read-only field
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text(); // response may be JSON or error
    console.log("Status:", res.status);
    console.log("Response body:", text);
  } catch (err) {
    console.error("Request failed:", err);
  }
}

testLogEntry();
