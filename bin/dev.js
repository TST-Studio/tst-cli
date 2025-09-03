#!/usr/bin/env -S node --import tsx
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { execute } from '@oclif/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

if (process.env.NODE_ENV != 'production') {
  const manifests = ['oclif.manifest.json', '.oclif.manifest.json']
    .map((name) => path.join(projectRoot, name))
    .filter((p) => fs.existsSync(p));

  if (manifests.length) {
    const manifestsList = manifests
      .map((p) => path.relative(projectRoot, p))
      .join(', ');
    console.warn(
      `\n⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ Detected oclif manifest(s) in dev mode: ${manifestsList}\n` +
        `    These can force oclif to load from "dist" and break tsx dev runs.\n` +
        `    Remove them to proceed:\n` +
        `      rm ${manifests.map((p) => JSON.stringify(path.relative(projectRoot, p))).join(' ')}\n`
    );
  }
}

await execute({ development: true, dir: import.meta.url });
