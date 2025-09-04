import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // if we want to test react/dom we have to change this to 'jsdom'
    globals: true,
  },
});
