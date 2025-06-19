import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import glob from 'fast-glob';

async function run() {
  const files = await glob('.vercel/output/functions/api/**/*.js', {
    ignore: ['**/*.map']
  });

  for (const file of files) {
    const funcDir = file.replace(/\.js$/, '.func');
    await fs.mkdir(funcDir, { recursive: true });
    await fs.rename(file, join(funcDir, 'index.js'));
    await fs.writeFile(
      join(funcDir, '.vc-config.json'),
      JSON.stringify({ runtime: 'nodejs20.x' })
    );
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
