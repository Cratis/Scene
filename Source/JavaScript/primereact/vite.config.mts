/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/* @ts-ignore TypeScript complains that the imported vite.config is not under rootDir, but it works at runtime */
import { createConfig } from '../../../vite.base';

const config = createConfig();
config.plugins.push(react());

// jsdom rather than node: the adapters are React components over PrimeReact, and the theme stylesheet
// swap is a real DOM operation on a <link> element. Specifying either against a stubbed environment
// would only prove the stub works.
config.test.environment = 'jsdom';
config.test.include = [...config.test.include, '**/for_*/when_*/**/*.tsx', '**/for_*/**/when_*.tsx'];

export default defineConfig(config);
