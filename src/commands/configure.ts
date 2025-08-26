import { Flags, Command } from '@oclif/core';
import { loadConfig, saveConfig } from '../utils/config.js';

export default class Configure extends Command {
  static description = 'Create or update tst.config.json';

  static flags = {
    provider: Flags.string({
      options: ['openai', 'anthropic', 'vertex', 'azure-openai', 'bedrock'],
    }),
    model: Flags.string(),
    outFormat: Flags.string({ options: ['sameLocation', 'testDir'] }),
    outBaseSrc: Flags.string(),
    outBaseTest: Flags.string(),
    astLibrary: Flags.string({ options: ['ts-morph', 'babel'] }),
    testingFramework: Flags.string({ options: ['vitest', 'jest'] }),
    moduleType: Flags.string({ options: ['module', 'commonjs'] }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Configure);
    const current = await loadConfig();
    const next = { ...current, ...flags };
    await saveConfig(next as any);
    this.log('Wrote tst.config.json');
  }
}
