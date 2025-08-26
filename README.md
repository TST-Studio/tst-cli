# tst

`tst` is a command line tool from [TST-Studio](https://github.com/TST-Studio) for generating test files using LLMs (like OpenAI, Claude, etc.).

The tool takes a JavaScript/TypeScript source file (and optionally a single function) and generates a Vitest test file for it.

---

## Installation

```bash
$ npm install -g @tst-studio/tst

added 77 packages in 2s

25 packages are looking for funding
  run `npm fund` for details
```

---

## Configuration

Add `tst.config.json` configuration file:

```bash
$ tst configure --outFormat=sameLocation
Wrote tst.config.json
```

---

## Usage

### Generate tests for a file

```bash
tst generate ./src/queue.js
```

This will submit the whole file to the LLM and create a test file in the appropriate location.

### Generate tests for a specific function

```bash
tst generate ./src/queue.js --function=enqueue
```

Only the `enqueue` function is sent to the LLM for test generation.

---

## Output Location

You can control where test files are generated using the `outFormat` option in `tst.config.json`.

- **sameLocation**

  ```bash
  tst generate ./src/queue.js --outFormat=sameLocation
  ```

  Produces: `./src/queue.test.js`

- **testDir**
  ```bash
  tst generate ./src/queue.js --outFormat=testDir --outBaseSrc=./src --outBaseTest=./tests
  ```
  Produces: `./tests/queue.test.js`

---

## Configuration

`tst` expects a configuration file in your project root:

`tst.config.json`

Example:

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "outFormat": "testDir",
  "outBaseSrc": "./src",
  "outBaseTest": "./tests",
  "astLibrary": "ts-morph",
  "testingFramework": "vitest",
  "moduleType": "module"
}
```

### Fields

- **provider**: `"openai"` (future: `"anthropic"`, `"vertex"`, `"azure-openai"`, `"bedrock"`, etc.)
- **model**: `"gpt-4o-mini"` (future: `"gpt-4o"`, `"gpt-4.1"`, `"gpt-4.1-mini"`)
- **outFormat**: `"sameLocation" | "testDir"`
- **outBaseSrc**: Root including `src` (used when `outFormat` is `testDir`)
- **outBaseTest**: Root including `tests` (used when `outFormat` is `testDir`)
- **astLibrary**: `"ts-morph"` (future: `"babel"`)
- **testingFramework**: `"vitest"` (future: `"jest"`, etc.)
- **moduleType**: `"module"` (future: `"commonjs"`, etc.)

---

## Commands

### Configure

```bash
tst configure
```

Generates `tst.config.json`. You can also specify fields via flags:

```bash
tst configure --provider=openai --model=gpt-4o-mini --outFormat=testDir --outBaseSrc=./src --outBaseTest=./tests --astLibrary=ts-morph --testingFramework=vitest --moduleType=module
```

### Generate

```bash
tst generate ./src/utils/math.js
tst generate ./src/utils/math.js --function=add
```

### Auth

```bash
tst auth set --provider=openai --api-key=$OPENAI_API_KEY
tst auth status
```

### Discovery

```bash
tst providers list
tst models list --provider=openai
tst config show
tst doctor
```

### Other

```bash
tst --help
tst --version
```

---

## Environment Variables

```bash
export OPENAI_API_KEY=sk-...
```

The API key is required to communicate with the LLM.

---

## Roadmap

- Support for additional providers (`anthropic`, `vertex`, `azure-openai`, `bedrock`)
- Alternative AST parsers (`babel`)
- Additional testing frameworks (`jest`)
- Module type options (`commonjs`)
- CI integration modes

---

## License

MIT (c) [TST-Studio](https://github.com/TST-Studio)
