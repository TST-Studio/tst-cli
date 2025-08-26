export type Provider =
  | 'openai'
  | 'anthropic'
  | 'vertex'
  | 'azure-openai'
  | 'bedrock';
export type OutFormat = 'sameLocation' | 'testDir';

export interface TstConfig {
  provider: Provider;
  model: string;
  outFormat: OutFormat;
  outBaseSrc?: string;
  outBaseTest?: string;
  astLibrary: 'ts-morph' | 'babel';
  testingFramework: 'vitest' | 'jest';
  moduleType: 'module' | 'commonjs';
}
