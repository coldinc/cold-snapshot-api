// convert-alias-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurable root + source
const BASE_DIR = __dirname;
const SOURCE_DIRS = ['api'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      results.push(filePath);
    }
  }
  return results;
}

function resolveRelative(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\\/g, '/');
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  const aliasImportRegex = /(['"])@\/([^'"]+)\1/g;

  const newContent = content.replace(aliasImportRegex, (match, quote, aliasPath) => {
    const targetPath = path.resolve(BASE_DIR, aliasPath);
    const relativePath = resolveRelative(filePath, targetPath);
    modified = true;
    return `${quote}${relativePath}${quote}`;
  });

  if (modified) {
    console.log(`✅ Updated: ${filePath}`);
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}

for (const dir of SOURCE_DIRS) {
  const absDir = path.join(BASE_DIR, dir);
  const files = walk(absDir);
  for (const file of files) {
    convertFile(file);
  }
}
