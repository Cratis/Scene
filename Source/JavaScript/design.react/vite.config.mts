/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/* @ts-ignore TypeScript complains that the imported vite.config is not under rootDir, but it works at runtime */
import { createConfig } from '../../../vite.base';

const config = createConfig();
config.plugins.push(react());

// The `@cratis/scene.*` packages and `@cratis/components` are workspace output whose ESM imports siblings without a file
// extension, and `@cratis/components` reaches `primereact/api` as a directory import. Node's own ESM loader rejects both
// forms, so they are inlined and resolved through Vite instead.
(config.test as Record<string, unknown>).server = {
    deps: {
        inline: [/@cratis[\\/]scene\./, /@cratis[\\/]components/, /primereact/],
    },
};

// The canvas is drawn into a DOM; the state logic does not need one but is not harmed by it.
config.test.environment = 'jsdom';
config.test.include = [...config.test.include, '**/for_*/when_*/**/*.tsx', '**/for_*/**/when_*.tsx'];

// The package's own setup runs after the shared one: it resets the module graph before every spec file, which is what
// lets the files run in parallel with `isolate: false` without seeing one another's mocks.
config.test.setupFiles = [config.test.setupFiles as string, './vitest.setup.ts'];
config.test.fileParallelism = true;

// Specifications that need a real Chromium run through `yarn test:browser` instead.
config.test.exclude = [...config.test.exclude, '**/*.browser.ts'];

export default defineConfig(config);
