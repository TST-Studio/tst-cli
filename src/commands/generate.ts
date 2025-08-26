import { Args, Flags, Command } from '@oclif/core';
import { extractFunctionCode } from '../services/ast.js';
import { writeTestFile } from '../services/test-writer.js';
import { computeOutPath } from '../utils/pathing.js';
import { loadConfig, resolveApiKey } from '../utils/config.js';
import { OpenAIClient } from '../providers/openai.js';
import { StubLlmClient } from '../services/llm.js';

export default class Generate extends Command {
  static description = 'Generate Vitest tests from a source file';

  static args = {
    file: Args.string({
      required: true,
      description: 'Path to source file (js/ts)',
    }),
  };

  static flags = {
    function: Flags.string({ description: 'Specific function name to target' }),
    outFormat: Flags.string({ options: ['sameLocation', 'testDir'] }),
    outBaseSrc: Flags.string(),
    outBaseTest: Flags.string(),
    provider: Flags.string({
      options: ['openai', 'anthropic', 'vertex', 'azure-openai', 'bedrock'],
    }),
    model: Flags.string(),
    force: Flags.boolean({ default: false }),
    'dry-run': Flags.boolean({ default: false } as any),
    stdout: Flags.boolean({ default: false }),
    json: Flags.boolean({ default: false }),
    verbose: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Generate);
    const cfg = await loadConfig();

    const provider = flags.provider ?? cfg.provider;
    const model = flags.model ?? cfg.model;
    const outFormat = (flags.outFormat ?? cfg.outFormat) as
      | 'sameLocation'
      | 'testDir';
    const outBaseSrc = flags.outBaseSrc ?? cfg.outBaseSrc;
    const outBaseTest = flags.outBaseTest ?? cfg.outBaseTest;

    const sourcePath = args.file;

    const code = await extractFunctionCode(sourcePath, flags.function);

    // Resolve LLM client
    let client;
    if (provider === 'openai') {
      const key = resolveApiKey('openai');
      client = key ? new OpenAIClient(key) : new StubLlmClient();
    } else {
      client = new StubLlmClient();
    }

    const testContent = await client.generateVitest({
      sourceCode: code,
      model,
    });

    const outPath = computeOutPath(
      sourcePath,
      outFormat,
      outBaseSrc,
      outBaseTest
    );

    if (flags['dry-run']) {
      this.log(testContent);
      return;
    }

    if (flags.stdout) {
      this.log(testContent);
      return;
    }

    const written = await writeTestFile(outPath, testContent, {
      force: flags.force,
    });

    if (flags.json) {
      this.log(
        JSON.stringify(
          { input: sourcePath, output: written, provider, model },
          null,
          2
        )
      );
    } else {
      this.log(`Wrote ${written}`);
    }
  }
}
