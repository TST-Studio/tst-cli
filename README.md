<div align="center">
 <img src="images/logo.png" alt="logo" width="100%" height="auto" />
  <!--h1>TST Studio.</!--h1-->
  <!-- Badges -->
<p>
  <a href="https://github.com/TST-Studio/tst-cli/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/TST-Studio/tst-cli" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/TST-Studio/tst-cli" alt="last update" />
  </a>
  <a href="https://github.com/TST-Studio/tst-cli/network/members">
    <img src="https://img.shields.io/github/forks/TST-Studio/tst-cli" alt="forks" />
  </a>
  <a href="https://github.com/TST-Studio/tst-cli/stargazers">
    <img src="https://img.shields.io/github/stars/TST-Studio/tst-cli" alt="stars" />
  </a>
  <a href="https://github.com/TST-Studio/tst-cli/issues">
    <img src="https://img.shields.io/github/issues/TST-Studio/tst-cli" alt="open issues" />
  </a>
  <a href="https://github.com/TST-Studio/tst-cli/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/TST-Studio/tst-cli.svg" alt="license" />
  </a>
</p>

<h4>
    <a href="https://tst-studio.com/">View Demo</a>
  <span> · </span>
    <a href="https://github.com/TST-Studio/tst-cli">Documentation</a>
  <span> · </span>
    <a href="https://github.com/TST-Studio/tst-cli/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/TST-Studio/tst-cli/issues/">Request Feature</a>
  </h4>

</div>

<!-- About the Project -->

## About the Project

`tst` is a tool from TST-Studio that **automatically generates unit tests for JavaScript and TypeScript code**, helping developers maintain flow, reduce boilerplate, and improve test coverage.
Built with **TypeScript, Vitest, OCLIF, ts-morph, and LLMs (like OpenAI, Claude, etc)**.

<div align="center">
  <img src="images/Screenshot.png" alt="screenshot" />
</div>

## Example

#### Math.ts

```ts
export function add(a: number, b: number): number {
  return a + b;
}
```

#### Generated test (math.test.ts):

```ts
import { describe, it, expect } from 'vitest';
import { add } from './math';

describe('add', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

<!-- Table of Contents -->

### Table of Contents

- [About the Project](#about-the-project)
  - [Tech Stack](#tech-stack)
  - [Features](#features)
  - [Environmental Variables](#environment-variables)

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Tests](#running-tests)
- [Commands](#commands)
- [Generate](#generate)
- [Auth](#auth)
- [Roadmap](#roadmap)
- [License](#license)

<!-- TechStack -->

### Tech Stack

- **Language:** TypeScript
- **Test Runner:** Vitest
- **CLI Framework:** OCLIF
- **LLM Integration:** OpenAI
- **AST Parsing:** ts-morph

<!-- Features -->

### Features

- Generate unit tests automatically from source files
- Output structured, runnable Vitest test files
- CLI interface for smooth developer workflow

---

## Getting Started

You can use this tool in your own repositories.

### Installation

```bash
$ npm install @tst-studio/tst
```

---

### Configuration

Automatically add `tst.config.json` configuration file:

```bash
$ tst configure --outFormat=sameLocation
Wrote tst.config.json
```

---

### Usage

#### Generate tests for a file

```bash
tst generate ./src/queue.js
```

This will submit the whole file to the LLM and create a test file in the appropriate location.

## How to Contribute

Help us build the most seamless automated test generation tool possible.

### Issues & PRs welcome!

- Repo: https://github.com/TST-Studio/tst-cli
- Issues: https://github.com/TST-Studio/tst-cli/issues

### Before opening a PR:

- Write tests where appropriate (or use this tool! 😀 )
- Run `npm run format:check && npm test`.

### Prerequisites

Ensure you have the following installed:

- [Node.js v18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Tech Stack

- **Language:**
  - [TypeScript](https://www.typescriptlang.org/)

- **CLI Framework:**
  - [OCLIF (@oclif/core)](https://oclif.io/)

- **Parsing & Utilities:**
  - [ts-morph](https://ts-morph.com/) – TypeScript AST parsing
  - [globby](https://github.com/sindresorhus/globby) – File globbing
  - [fs-extra](https://github.com/jprichardson/node-fs-extra) – Extended file system utilities
  - [chalk](https://github.com/chalk/chalk) – Terminal styling
  - [zod](https://zod.dev/) – Schema validation
  - [dotenv](https://github.com/motdotla/dotenv) – Environment variable management

- **Developer Tooling:**
  - [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) – Code linting and formatting
  - [Husky](https://typicode.github.io/husky) – Git hooks (e.g., lint on commit)
  - [tsx](https://tsx.is/) – Run TypeScript directly in dev mode
  - [TypeScript (tsc)](https://www.typescriptlang.org/docs/handbook/compiler-options.html) – Compiler
  - [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node) – Node.js type definitions

- **OCLIF Support:**
  - [oclif](https://oclif.io/) – CLI scaffolding and packaging
  - [@oclif/plugin-legacy](https://github.com/oclif/plugin-legacy) – Legacy command support
  - `oclif.manifest.json` – Generated CLI manifest

### Developing

The `dev.js` command is a development command that represents the `tst` command but will continue to compile Typescript on the fly while developing.

```
$ bin/dev.js
LLM-powered unit test generator CLI by TST-Studio

VERSION
  @tst-studio/tst/0.1.0 darwin-arm64 node-v22.17.1

USAGE
  $ tst [COMMAND]

TOPICS
  auth  Write API key to local .env or create one

COMMANDS
  configure  Create or update tst.config.json
  generate   Generate Vitest tests from a source file
```

To test outside of the `tst-cli` repo (e.g., to test against a different `tsconfig.json` file without breaking the tst command), use another repository like this sandbox repository:

https://github.com/TST-Studio/demo-test-script

---

## Publish (maintainers only)

Use this checklist when cutting a new release to npm.

### 0) Prerequisites

- [x] You are a maintainer for the @tst-studio org/package.
- [x] Your npm account has 2FA enabled.
- [x] You’re logged in: `npm whoami` (login with `npm login` if needed)

### 1) Branch is clean

Ensure:

- All code is formatted consistently: `npm run format`
- `README.md` is up to date
- All code is committed

Ensure main is clean:

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Next steps may fail if `main` is not clean.

### 2) Prep the release

Verify the package contents

1. Build the `tst` command:

```
npm run build
```

2. Pack the `tst` command and inspect the tarball

```
npm pack
```

3. View a publish dry run. Sanity check what is included:

```
npm publish --dry-run
```

### 3) Bump the version (SemVer)

This step updates `package.json`, creates a git tag (e.g., `v0.1.1`), and commits.

Determine if this is:

- A **patch** (bug fix. No functionality changed)
- A **minor** release (functionality was added)
- A **major** release (backwards incompatible changes added)

- Ensure main is clean (see step 1).

**NOTE**: The following instructions need to have single quotes (not double quotes) as they can include an exclamation mark (used by the "npm version" command). Without the single quotes, the exclamation mark can be interpreted as a history command by the shell.

#### If Patch

```
npm version patch -m 'chore(release): %s'
```

#### If Minor

```
npm version minor -m 'feat!: %s'
```

#### If Major

```
npm version major -m 'feat!: %s'
```

### 4) Publish to NPM

```
npm publish
```

### 5) Push tag and verify

```
git push --follow-tags
npm view @tst-studio/tst version
```

### Common Pitfalls

- **EPUBLISHCONFLICT**: That version already exists

- **E403 / not authorized to publish**: You’re not a maintainer for @tst-studio/tst under the org; ask an admin to add you or your team.

- **2FA errors**: Provide --otp=(Your code) or re-enable 2FA on your account.

- **Wrong files in the tarball**: Use `.npmignore` or files in `package.json`; re-run npm pack to confirm.

---

### Documentation

#### Output Location

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

#### Configuration

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

##### Fields

- **provider**: `"openai"` (future: `"anthropic"`, `"vertex"`, `"azure-openai"`, `"bedrock"`, etc.)
- **model**: `"gpt-4o-mini"` (future: `"gpt-4o"`, `"gpt-4.1"`, `"gpt-4.1-mini"`)
- **outFormat**: `"sameLocation" | "testDir"`
- **outBaseSrc**: Root including `src` (used when `outFormat` is `testDir`)
- **outBaseTest**: Root including `tests` (used when `outFormat` is `testDir`)
- **astLibrary**: `"ts-morph"` (future: `"babel"`)
- **testingFramework**: `"vitest"` (future: `"jest"`, etc.)
- **moduleType**: `"module"` (future: `"commonjs"`, etc.)

---

### Commands

#### Configure

```bash
tst configure
```

Generates `tst.config.json`. You can also specify fields via flags:

```bash
tst configure --provider=openai --model=gpt-4o-mini --outFormat=testDir --outBaseSrc=./src --outBaseTest=./tests --astLibrary=ts-morph --testingFramework=vitest --moduleType=module
```

#### Generate

```bash
tst generate ./src/utils/math.js                  # Generate unit tests for an entire file
tst generate ./src/utils/math.js --function=add   # Generate unit tests for a specific function

```

#### Auth

```bash
tst auth set --provider=openai --api-key=$TST_OPENAI_API_KEY
  # Store API key for a specific provider
tst auth status
  # Show current authentication status
```

#### Other Commands

```bash
tst --help      # Display available commands and usage
tst --version   # Show the current CLI version
```

---

### Environment Variables

```bash
export TST_OPENAI_API_KEY=sk-...
```

The API key is required to communicate with the LLM.

---

## License

MIT (c) [TST-Studio](https://github.com/TST-Studio)
