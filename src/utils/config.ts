import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { type TstConfig } from '../types/index.js';
import dotenv from 'dotenv';
dotenv.config();

const schema = z.object({
  provider: z
    .enum(['openai', 'anthropic', 'vertex', 'azure-openai', 'bedrock'])
    .default('openai'),
  model: z.string().default('gpt-4o-mini'),
  outFormat: z.enum(['sameLocation', 'testDir']).default('sameLocation'),
  outBaseSrc: z.string().optional(),
  outBaseTest: z.string().optional(),
  astLibrary: z.enum(['ts-morph', 'babel']).default('ts-morph'),
  testingFramework: z.enum(['vitest', 'jest']).default('vitest'),
  moduleType: z.enum(['module', 'commonjs']).default('module'),
});

export const CONFIG_FILENAME = 'tst.config.json';

export async function loadConfig(cwd = process.cwd()): Promise<TstConfig> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  if (!existsSync(configPath)) {
    // return defaults if missing
    return schema.parse({});
  }
  const raw = await readFile(configPath, 'utf8');
  const json = JSON.parse(raw);
  return schema.parse(json);
}

export async function saveConfig(
  cfg: TstConfig,
  cwd = process.cwd()
): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  await writeFile(configPath, JSON.stringify(cfg, null, 2));
}

export function resolveApiKey(provider: string): string | undefined {
  const generic = process.env.TST_API_KEY;
  if (generic) return generic;
  const map: Record<string, string> = {
    openai: 'TST_OPENAI_API_KEY',
    anthropic: 'TST_ANTHROPIC_API_KEY',
    vertex: 'TST_VERTEX_API_KEY',
    'azure-openai': 'TST_AZURE_OPENAI_API_KEY',
    bedrock: 'TST_BEDROCK_API_KEY',
  };
  const envName = map[provider];
  return envName ? process.env[envName] : undefined;
}
