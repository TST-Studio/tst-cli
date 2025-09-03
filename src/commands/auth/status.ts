import { Command, Flags } from '@oclif/core';
import { resolveApiKey } from '../../utils/config.js';

export default class AuthStatus extends Command {
  static description =
    'Show whether an API key is available for the configured provider (via env vars).';

  static flags = {
    provider: Flags.string({
      options: ['openai', 'anthropic', 'vertex', 'azure-openai', 'bedrock'],
      default: 'openai',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthStatus);
    const key = resolveApiKey(flags.provider);
    if (key) this.log(`Key for ${flags.provider}: set (length=${key.length})`);
    else
      this.log(
        `No key found for ${flags.provider}. Use "tst auth set" or set env var.`
      );
  }
}
