/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/* @ts-ignore TypeScript complains that the imported vite.config is not under rootDir, but it works at runtime */
import { createConfig } from '../../../vite.base';

const config = createConfig();

// The templates are rendered by specs, so: jsdom rather than the base `node` environment, the React
// plugin for JSX, and `.tsx` spec files alongside the base `.ts` ones.
config.plugins.push(react());
config.test.environment = 'jsdom';
config.test.include = [...config.test.include, '**/for_*/when_*/**/*.tsx', '**/for_*/**/when_*.tsx'];

// The `@cratis` scope has to go through Vite's resolver rather than Node's own ESM loader. The Scene
// packages publish `dist/esm/*.js` without declaring `"type": "module"`, so Node reads those files as
// CommonJS and chokes on their `import`/`export` syntax - and this package's specs import
// `@cratis/scene.components` directly, plus every Scene package it pulls in behind that.
//
// PrimeReact is kept on the list although the reason it was added for - v10's directory imports, which
// Node's resolver rejected - is gone: v11 declares `"type": "module"` and a complete subpath `exports`
// map, so Node can load it unaided. Narrowing this is a separate change with its own test run.
config.test.server = { deps: { inline: [/@cratis[\\/]/, /primereact/] } };

export default defineConfig(config);
