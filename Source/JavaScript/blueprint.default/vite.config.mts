/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/* @ts-ignore TypeScript complains that the imported vite.config is not under rootDir, but it works at runtime */
import { createConfig } from '../../../vite.base';

const config = createConfig();
config.plugins.push(react());
config.test.environment = 'jsdom';
// Specifications that need a real Chromium run through `yarn test:browser` instead.
config.test.exclude = [...config.test.exclude, '**/*.browser.ts'];
config.test.include = [...config.test.include, '**/for_*/when_*/**/*.tsx', '**/for_*/**/when_*.tsx'];

export default defineConfig(config);
