import { promises as fs } from 'fs';
import { join } from 'path';
import glob from 'fast-glob';

async function main() {
  const files = await glob('/vercel/output/functions/**/*.{js,cjs}', {
    ignore: ['**/*.map']
  });

  for (const file of files) {
    const funcDir = file.replace(/\.(c?js)$/, '.func');
    await fs.mkdir(funcDir, { recursive: true });
    await fs.rename(file, join(funcDir, 'index.js'));
    await fs.writeFile(
      join(funcDir, '.vc-config.json'),
      JSON.stringify({ runtime: 'nodejs20.x', handler: 'index.js' })
    );
  }

  await fs.mkdir('/vercel/output', { recursive: true });
  await fs.writeFile('/vercel/output/config.json', JSON.stringify({ version: 3 }));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
