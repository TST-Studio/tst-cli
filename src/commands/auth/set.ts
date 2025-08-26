import { Flags, Command } from '@oclif/core';
import fs from 'node:fs/promises';
import path from 'node:path';

export default class AuthSet extends Command {
  static description = 'Write API key to local .env or create one';

  static flags = {
    provider: Flags.string({
      required: true,
      options: ['openai', 'anthropic', 'vertex', 'azure-openai', 'bedrock'],
    }),
    'api-key': Flags.string({ required: true }),
    env: Flags.string({
      description: 'Path to .env file (default: project root ./.env)',
    }),
    generic: Flags.boolean({
      description: 'Write TST_API_KEY instead of provider-specific var',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthSet);
    const envPath = flags.env ?? path.join(process.cwd(), '.env');
    const varName = flags.generic
      ? 'TST_API_KEY'
      : {
          openai: 'TST_OPENAI_API_KEY',
          anthropic: 'TST_ANTHROPIC_API_KEY',
          vertex: 'TST_VERTEX_API_KEY',
          'azure-openai': 'TST_AZURE_OPENAI_API_KEY',
          bedrock: 'TST_BEDROCK_API_KEY',
        }[flags.provider];

    const line = `\n${varName}=${flags['api-key']}\n`;
    try {
      await fs.appendFile(envPath, line, 'utf8');
    } catch {
      await fs.writeFile(envPath, line, 'utf8');
    }
    this.log(`Wrote ${varName} to ${envPath}`);
  }
}
