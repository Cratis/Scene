// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { rollup } from '../../../rollup.config.mjs';

import pkg from './package.json' with { type: 'json' };

import path from "path";

const cjsPath = path.dirname(pkg.main);
const esmPath = path.dirname(pkg.module);
const tsconfigPath = path.join(import.meta.dirname, "tsconfig.json");

const config = rollup(cjsPath, esmPath, tsconfigPath, pkg);

// `runtime.ts` is a second entry point (published as `./runtime`) that reaches no design-time module, so a
// runtime host can load the package without its designers, editors and actions.
config.input = ['index.ts', 'runtime.ts'];

export default config;
