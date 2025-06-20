import fs from "fs";

export default function handler(req: any, res: any) {
  try {
    const apiFiles = fs.readdirSync(__dirname);
    res.status(200).json({ apiFiles });
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
