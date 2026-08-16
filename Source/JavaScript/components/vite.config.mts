/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/* @ts-ignore TypeScript complains that the imported vite.config is not under rootDir, but it works at runtime */
import { createConfig } from '../../../vite.base';

const config = createConfig();

// Adapters are React components, so their specs render them: jsdom rather than the base `node`
// environment, the React plugin for JSX, and `.tsx` spec files alongside the base `.ts` ones - the same
// three additions `@cratis/scene.react` makes for the same reason.
config.plugins.push(react());
config.test.environment = 'jsdom';
config.test.include = [...config.test.include, '**/for_*/when_*/**/*.tsx', '**/for_*/**/when_*.tsx'];

// `@cratis/components` and PrimeReact are published as ESM that still uses directory imports
// (`primereact/api`), which Node's own ESM resolver rejects. Inlining them puts both through Vite's
// resolver - the same one that serves them in a browser build - instead of leaving them to Node.
config.test.server = { deps: { inline: [/@cratis[\\/]components/, /primereact/] } };

export default defineConfig(config);
