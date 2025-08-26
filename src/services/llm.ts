export interface LlmClient {
  name: string;
  generateVitest(input: { sourceCode: string; model: string }): Promise<string>;
}

// Stub client used during development. Replace with provider-specific implementations.
export class StubLlmClient implements LlmClient {
  name = 'stub';
  async generateVitest({
    sourceCode,
  }: {
    sourceCode: string;
    model: string;
  }): Promise<string> {
    // Minimal placeholder output so the CLI is usable before wiring real APIs.
    return `import { describe, it, expect } from 'vitest'\n\ndescribe('auto-generated', () => {\n  it('smoke', () => {\n    expect(typeof ${'function' in globalThis ? 'function' : 'Object'}).toBe('function')\n  })\n})\n`;
  }
}
