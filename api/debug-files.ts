import fs from "fs";
import path from "path";

// Helper: Recursively list all files under a directory
function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap(f => {
    const fullPath = path.join(dir, f);
    return fs.statSync(fullPath).isDirectory()
      ? walk(fullPath)
      : [fullPath];
  });
}

export default function handler(req: any, res: any) {
  const cwd = process.cwd();
  const rootFiles = fs.readdirSync(cwd);

  // Try relative 'lib'
  let libFiles;
  try {
    libFiles = fs.existsSync("lib") ? fs.readdirSync("lib") : "lib missing";
  } catch (e) {
    libFiles = "error reading ./lib";
  }

  // Try absolute lib path
  const absLibPath = path.join(cwd, "lib");
  let absLibFiles;
  try {
    absLibFiles = fs.existsSync(absLibPath) ? fs.readdirSync(absLibPath) : "lib missing";
  } catch (e) {
    absLibFiles = "error reading abs lib";
  }

  // Recursively list everything under cwd (optional, but super helpful)
  let allFiles;
  try {
    allFiles = walk(cwd);
  } catch (e) {
    allFiles = "error walking cwd";
  }

  // Log for Vercel dashboard
  console.log("DEBUG: cwd:", cwd);
  console.log("DEBUG: rootFiles:", rootFiles);
  console.log("DEBUG: libFiles (relative):", libFiles);
  console.log("DEBUG: libFiles (abs):", absLibFiles);
  console.log("DEBUG: absLibPath:", absLibPath);
  console.log("DEBUG: allFiles:", allFiles);

  res.status(200).json({
    cwd,
    rootFiles,
    libFiles,
    absLibPath,
    absLibFiles,
    allFiles,
  });
}
