/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';

/* @ts-ignore TypeScript complains that the imported vite.config is not under rootDir, but it works at runtime */
import { createConfig } from '../../../vite.base';

// The browser specifications drive a real Chromium, so they run on their own (`yarn test:browser`) and not
// as part of the jsdom suite: a machine without the browser installed must not turn the whole suite red,
// and a browser specification must never be skipped silently either.
const config = createConfig();
config.test.environment = 'node';
config.test.include = ['**/for_*/**/*.browser.ts'];
config.test.testTimeout = 30000;
config.test.hookTimeout = 60000;

export default defineConfig(config);
