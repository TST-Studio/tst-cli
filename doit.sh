#!/bin/bash
set -euo pipefail
# passing the SUT as the first arg or a default path (testRun.ts)
SUT="${1:-src/testRun.ts}"
# where to write the test
OUTFMT="${2:-sameLocation}"
# derive the test file path for clean up while using sameLocation
BASE="${SUT%.*}"
EXT="${SUT##*.}"
TEST_EXT=$([[ "$EXT" =~ ^tsx$ ]] && echo "test.tsx" || echo "test.ts")
TEST_PATH="${BASE}.${TEST_EXT}"

rm -f "$TEST_PATH"
npm run build 
node ./bin/run.js generate "$SUT" --outFormat "$OUTFMT"

#! can add this to run the vitest test
    # npx vitest run (will run Vitest after generation to validate test compiles / runs)
    # saved under "run" in package.json
npx vitest run