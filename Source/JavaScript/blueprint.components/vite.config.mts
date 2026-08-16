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

// `@cratis/components` and PrimeReact are published as ESM that still uses directory imports
// (`primereact/api`), which Node's own ESM resolver rejects - and this package reaches them transitively,
// through `@cratis/scene.components`, so the whole `@cratis` scope has to go through Vite's resolver
// rather than only the leaf that causes it. `@cratis/scene.components` matches this package's specs
// import it directly, and every Scene package it pulls in behind that.
config.test.server = { deps: { inline: [/@cratis[\\/]/, /primereact/] } };

export default defineConfig(config);
