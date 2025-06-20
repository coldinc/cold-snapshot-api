import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  const rootFiles = fs.readdirSync(process.cwd());
  const libFiles = fs.existsSync("lib") ? fs.readdirSync("lib") : "lib missing";
  console.log("DEBUG: Files at root:", rootFiles);
  console.log("DEBUG: Files in lib:", libFiles);
  res.status(200).json({ rootFiles, libFiles });
}
