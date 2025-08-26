import path from 'node:path';
import { type OutFormat } from '../types/index.js';

export function computeOutPath(
  sourcePath: string,
  outFormat: OutFormat,
  outBaseSrc?: string,
  outBaseTest?: string
): string {
  if (outFormat === 'sameLocation') {
    const { dir, name, ext } = path.parse(sourcePath);
    return path.join(dir, `${name}.test${ext}`);
  }
  // testDir
  if (!outBaseSrc || !outBaseTest) {
    throw new Error(
      'outBaseSrc and outBaseTest are required when outFormat is "testDir".'
    );
  }
  const rel = path.relative(outBaseSrc, sourcePath);
  const { dir, name, ext } = path.parse(rel);
  return path.join(outBaseTest, dir, `${name}.test${ext}`);
}
