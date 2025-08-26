import type { LlmClient } from '../services/llm.js';

export class OpenAIClient implements LlmClient {
  name = 'openai';
  constructor(private apiKey: string) {}

  async generateVitest({
    sourceCode,
    model,
  }: {
    sourceCode: string;
    model: string;
  }): Promise<string> {
    // TODO: call OpenAI responses API with tools/prompts to produce Vitest
    // For now, return a friendly placeholder so the CLI runs end-to-end.
    return `import { describe, it, expect } from 'vitest'\n\ndescribe('placeholder from OpenAI', () => {\n  it('generates a trivial test', () => {\n    expect(${JSON.stringify(sourceCode.slice(0, 10))}.length).toBeGreaterThan(0)\n  })\n})\n`;
  }
}
