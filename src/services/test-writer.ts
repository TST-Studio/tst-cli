import fs from 'node:fs/promises';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

export async function writeTestFile(
  outPath: string,
  content: string,
  { force = false } = {}
) {
  await mkdir(path.dirname(outPath), { recursive: true });
  try {
    if (!force) {
      // if exists, throw
      await fs.access(outPath);
      throw new Error(
        `Refusing to overwrite existing file: ${outPath}. Use --force to override.`
      );
    }
  } catch {
    // ok if not exists
  }
  await fs.writeFile(outPath, content, 'utf8');
  return outPath;
}
