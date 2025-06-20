// api/health.ts     ← exact filename

// Standard Node.js API route
import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  console.log("CWD:", process.cwd());
  console.log("Files at root:", fs.readdirSync(process.cwd()));
  console.log("Files in lib:", fs.existsSync("lib") ? fs.readdirSync("lib") : "lib missing");
  res.status(200).json({ status: "ok" });
}

const apiHealthHandler = async (req: any, res: any) => {
  return res
    .status(200)
    .json({ status: "ok", timestamp: new Date().toISOString() });
};

export default apiHealthHandler;
