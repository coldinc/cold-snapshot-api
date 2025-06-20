import fs from "fs";
export default function handler(req: any, res: any) {
  const apiFiles = fs.readdirSync(__dirname);
  res.status(200).json({ apiFiles });
}
