import { Args, Flags, Command } from '@oclif/core';
import path from 'node:path';
import { extractFunctionCode } from '../services/ast.js';
import { writeTestFile } from '../services/test-writer.js';
import { computeOutPath } from '../utils/pathing.js';
import { loadConfig, resolveApiKey } from '../utils/config.js';
import { OpenAIClient } from '../providers/openai.js';

export default class Generate extends Command {
  // description for the oclif to help output
  static description = 'Generate Vitest tests from a source file';

  // defining positional arguments: required "file" path to SUT
  static args = {
    file: Args.string({
      required: true,
      description: 'Path to source file (js/ts)',
    }),
  };
  // Optional flags to customize behavior and destinations
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
    // parses CLI inputs and load user/project config
    const { args, flags } = await this.parse(Generate);
    const cfg = await loadConfig();
    // merging flags with config defaults (flags will win over defaults)
    const provider = flags.provider ?? cfg.provider;
    const model = flags.model ?? cfg.model;
    const outFormat = (flags.outFormat ?? cfg.outFormat) as
      | 'sameLocation'
      | 'testDir';
    const outBaseSrc = flags.outBaseSrc ?? cfg.outBaseSrc;
    const outBaseTest = flags.outBaseTest ?? cfg.outBaseTest;

    // the SUT path
    const sourcePath = args.file;

    // read the source code for the LLM prompt
    const code = await extractFunctionCode(sourcePath, flags.function);

    // deciding where the test file will be written (uses repo conventions & flags)
    const outPath = computeOutPath(
      sourcePath,
      outFormat,
      outBaseSrc,
      outBaseTest
    );

    // calculate the import path the test should use to import the SUT
    const fromDir = path.dirname(outPath);
    const relRaw = path.relative(fromDir, sourcePath);
    const relPosix = relRaw.split(path.sep).join(path.posix.sep);
    const relWithDot = relPosix.startsWith('.') ? relPosix : `./${relPosix}`;
    const noExt = relWithDot.replace(/\.(tsx?|jsx?|mjs|cjs)$/, '');
    const importPath = `${noExt}.js`;

    // initialize the chosen LLM client (currently openai)
    // validates API key & provides repo profile for model
    let client;
    if (provider === 'openai') {
      const key = resolveApiKey('openai');
      if (!key) {
        throw new Error(
          '❌ OpenAI API key is require but not configured. Please include your API key in configuration.'
        );
      }
      // this helps the model behave and infer testDir & suffix
      const isTsx = /\.tsx$/i.test(sourcePath);
      const suffix = isTsx ? '.test.tsx' : '.test.ts';
      // translates outFormat to the repo profile testDir setting
      const testDir = outFormat === 'testDir' ? '__tests__' : 'co-located';

      client = new OpenAIClient(key, {
        //! tells the model exactly how to import the SUT
        importPath,
        repoProfile: {
          testEnv: 'node', // have to change this to 'jsdom' if we are testing react/dom
          testDir,
          suffix,
        },
        temperature: 0.2,
        maxOutputTokens: 1500, // cap output size: so its a single test file
        model,
      });
    }

    // ask the LLM to generate the test code
    let testContent = '';
    if (client) {
      testContent = await client.generateVitest({
        sourceCode: code,
        model,
        sutFilePath: sourcePath,
        testOutPath: outPath,
      });
    }

    // if user wants a dry run (print and exit)
    if (flags['dry-run'] || flags.stdout) {
      this.log(testContent);
      return;
    }

    // write the test file to disk (respects --force)
    const written = await writeTestFile(outPath, testContent, {
      force: flags.force,
    });

    // final reporting: JSON for scripts, or human-friendly string
    if (flags.json) {
      this.log(
        JSON.stringify(
          { input: sourcePath, output: written, provider, model },
          null,
          2
        )
      );
    } else {
      this.log(`🚀 Generated test file: ${written} 🚀`);
    }
  }
}
