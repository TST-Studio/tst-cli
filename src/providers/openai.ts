import OpenAI from 'openai';
import type { LlmClient } from '../services/llm.js';
import path from 'node:path';
import { no } from 'zod/v4/locales';

// makes sure there foward slashes even on windows for import paths
function toPosix(p: string) {
  return p.split(path.sep).join(path.posix.sep);
}

// function to use the repo profile to direct where the test file is made
function suggestTestOutPath(sutFilePath: string, profile: RepoProfile): string {
  const dir = path.dirname(sutFilePath);
  const base = path.basename(sutFilePath).replace(/\.(tsx?|jsx?|mjs|cjs)$/, ''); // removes the different types of possible files (.ts, .js, tsx,)
  if (profile.testDir === '__tests__') {
    return path.join(dir, '__tests__', `${base}${profile.suffix}`); // runs it through the test directory
  }
  return path.join(dir, `${base}${profile.suffix}`); // creates the path for the import to match the current file
}

/** calculate the import path that the test should use to import the current file/ function (SUT: Subject Under Test) */
function calculateImportPath(sutFilePath: string, testOutPath: string, nodeNext = true): string {
  const from = path.dirname(testOutPath);
  const rel = toPosix(path.relative(from, sutFilePath)); // connecting the test file and SUT paths
  const withDot = rel.startsWith('.') ? rel : `./${rel}`; // making sure the relative starts with a period
  const noExt = withDot.replace(/\.(tsx?|jsx?|mjs|cjs)$/, ''); 
  return nodeNext ? `${noExt}.js` : noExt;
}


/*  Persona presets: helps guide generation style (express route test vs React test) */
export type Persona = 
'senior-test-engineer' |
'react-specialist' |
'express-verifier' |
'type-edge-hunter' |
'mocking-minimalist' |
'coverage-coach';

/* Repo profile for awareness: facts about repo layout to help model write test that run */
export interface RepoProfile {
  testEnv: 'node' | 'jsdom';
  testDir: 'co-located' | '__tests__';
  suffix: string;
  aliases?: Record<string, string>;
  setupFiles?: string[];
  libs?: string[];
  styleNotes?: string;
}

/* Optional: constructor defaults */
export interface OpenAIClientDefaults {
  importPath?: string;
  persona?: Persona;
  repoProfile?: RepoProfile;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}

/*  Persona add-on rules: for the base prompt, depending on persona  */
const PERSONA_ADDONS: Record<Persona, string> = {
  'senior-test-engineer': 'Prefer table-driven tests; avoid snapshots; minimal mocking.',
  'react-specialist': 'Use @testing-library/react and @testing-library/user-event; assume jsdom; test roles/labels and critical user flows; avoid implementation details.',
  'express-verifier': 'Use supertest where possible; cover success, validation error, and failure paths; assert status codes and JSON bodies; mock only external services.',
  'type-edge-hunter': 'Exercise unions, optionals, defaults, and guards; assert thrown errors precisely (message & type) where meaningful.',
  'mocking-minimalist': 'Favor real imports; mock only network/fs/process boundaries; never mock the system under test.',
  'coverage-coach': 'Ensure each branch/conditional is touched; keep each test short and focused.',
};

/** Base test-writer system prompt. Tokens get replaced before send */
const BASE_SYSTEM_PROMPT = `
You are a senior TypeScript test writer. Produce a minimal, runnable Vitest test file that exercises key branches and edge cases.

Hard requirements:
- Runner: Vitest. Use ESM imports, no Jest-only APIs.
- import the SUT from {{importPath}} (relative path, no file extension).
- output ONLY the test file contents. No prose, no markdown fences, no filenames.
- Use describe/it/expect. Prefer small, focused tests; avoid snapshots unless structurally necessary.
- If async code exists, await it. If errors are thrown, assert with toThrow / rejects.toThrow.
- For pure functions: include at least 3 table-driven examples (typical, edge, error).
- For React components: use @testing-library/react (+ user-event). Assume jsdom.
- If external deps are present, minimally mock only what the test requires.
- Keep imports real--do not invent modules or matchers.

Repo constraints:
{{repoFactSheet}}

Persona rules:
{{personaAddOn}}

Banned:
- Do not emit markdown fences.
- Do not invent imports, matchers, or globals.
- Avoid snapshots unless necessary.

Quality bar:
- Cover conditional branches & default params you detect.
- Use vi.fn()/vi.spyOn when behavior depends on collaborators.
- Keep the file self-contained and compilable.
`.trim();

/** this helps assmble prompts: Build up user message with target modules code */
function buildUserPrompt(sourceCode: string, importPath: string): string {
  return [
    `Module under test import path: ${importPath}`,
    '',
    '----- BEGIN SOURCE -----',
    sourceCode,
    '----- END SOURCE -----',
    '',
    'Write the Vitest test file now. Remember: output only the test code, no backticks.',
  ].join('\n');
}

/** Will turn your repo settings into bullet points for the model to follow */
function buildRepoFactSheet(p: RepoProfile): string {
  return [
    'REPO FACT SHEET',
    `- testEnv: ${p.testEnv}`,
    `- testDir: ${p.testDir}, suffix: ${p.suffix}`,
    p.aliases ? `- tsconfig.paths: ${JSON.stringify(p.aliases)}` : null,
    p.setupFiles?.length ? `-vitest.setupFiles: ${JSON.stringify(p.setupFiles)}` : null,
    p.libs?.length ? `-libs present: ${p.libs.join(', ')}` : null,
    p.styleNotes ? `- preferred style: ${p.styleNotes}` : null,
  ].filter(Boolean).join('\n');
}

/** light auto-detection for sensible defaults without extra arguments */
/** helps narrow down persona options */
function autoDetectPersona(sourceCode: string): Persona {
  if (/\bfrom\s+['"]react['"]\b|<\w+[\s>]/.test(sourceCode)) return 'react-specialist';
  if (/\bexpress\b|\bsupertest\b|req\b.*res\b/.test(sourceCode)) return 'express-verifier';
  return 'senior-test-engineer';
}

/** will choose 'jsdom' for react components or 'node' as a default  */
function autoDetectRepoProfile(sourceCode: string): RepoProfile {
  const persona = autoDetectPersona(sourceCode);
  const jsdom = persona === 'react-specialist';
  return {
    testEnv: jsdom ? 'jsdom' : 'node',
    testDir: 'co-located',
    suffix: '.test.ts',
    libs: jsdom ? ['react', '@testing-library/react', '@testing-library/user-event'] : [],
    styleNotes: 'arrange-act-assert; avoid snapshots unless necessary',
  };
}

/** Defensive cleanup for accidental markdown fences (helps remove unecessary ``` fences) */
function stringMarkdownFences(text: string): string {
  return text.replace(/```[a-z]*\n?([\s\S]*?)```/g, '$1').trim();
}

/** minimal sanity check: something test-like back */
  /** Makes sure written test contain atleast describe and it/test */
function looksLikeVitest(text: string): boolean {
  return /\bdescribe\s*\(/.test(text) && (/\bit\s*\(/.test(text) || /\btest\s*\(/.test(text));
}

/** stores SDK instances and defaults passed in  */
export class OpenAIClient implements LlmClient {
  name = 'openai';
  private client: OpenAI;

  constructor(
    private apiKey: string,
    private defaults: OpenAIClientDefaults = {}
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async generateVitest({
    sourceCode,
    model,
    sutFilePath, // either the absolute path or repo-relative path to the SUT
    testOutPath, // where the test file is being written
  }: {
    sourceCode: string;
    model: string;
    sutFilePath: string;
    testOutPath?: string;
  }): Promise<string> {
    // guides context for model
    const persona: Persona = this.defaults.persona ?? autoDetectPersona(sourceCode);
    const repoProfile: RepoProfile = this.defaults.repoProfile ?? autoDetectRepoProfile(sourceCode);
    // guiding where the test goes
    const resolvedTestOutPath = testOutPath ?? suggestTestOutPath(sutFilePath, repoProfile);
    // decides what import the test should use to reach the SUT
    const importPath = this.defaults.importPath ?? calculateImportPath(sutFilePath, resolvedTestOutPath, true);
    // builds out the final system prompt
    const personaAddon = PERSONA_ADDONS[persona];
    const repoFactSheet = buildRepoFactSheet(repoProfile);

    const system = BASE_SYSTEM_PROMPT
      .replace('{{importPath}}', importPath)
      .replace('{{repoFactSheet}}', repoFactSheet)
      .replace('{{personaAddOn}}', personaAddon);

    // build the user content
    const user = buildUserPrompt(sourceCode, importPath);
    // API responses
    const res = await this.client.responses.create({
      model: model || this.defaults.model || 'gpt-4o-mini',
      instructions: system,
      input: user,
      temperature: this.defaults.temperature ?? 0.2,
      max_output_tokens: this.defaults.maxOutputTokens ?? 1500,
    });
    // local clean up after model sends response back
    let out = stringMarkdownFences(res.output_text ?? '');

    // self-heals: this will detect problems and try to auto-fix (output isnt uasable -> trys to auto correct it)
    if (!looksLikeVitest(out)) {
      // corrective hints to help shape check 
      const fixup = await this.client.responses.create({
        model: model || this.defaults.model || 'gpt-4o-mini',
        instructions: system,
        input:
          user + '\n\nThe previous output was not a Vitest file. Fix by returning ONLY valid Vitest test code that compiles.',
          temperature: this.defaults.temperature ?? 0.2,
          max_output_tokens: this.defaults.maxOutputTokens ?? 1500,
      });
      out = stringMarkdownFences(fixup.output_text ?? '');
    }
    // if output still fails, this will throw an error
    if (!looksLikeVitest(out)) {
      throw new Error('❌ Model did not return a runnable file. Check prompts or source.');
    }
    return out;
  }
}
