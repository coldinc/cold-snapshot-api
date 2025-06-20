import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req: any, res: any) {
  try {
    const apiFiles = fs.readdirSync(__dirname);
    res.status(200).json({ apiFiles, __dirname });
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
