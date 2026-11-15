// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { rollup } from '../../../rollup.config.mjs';

import pkg from './package.json' with { type: 'json' };

import path from "path";
import { readFileSync } from "fs";
import { globSync } from "glob";

const cjsPath = path.dirname(pkg.main);
const esmPath = path.dirname(pkg.module);
const tsconfigPath = path.join(import.meta.dirname, "tsconfig.json");

/**
 * The canvas' components import their own stylesheets (`import './X.css'`). A stylesheet is not part of the JavaScript graph: it stays an
 * import for the consuming bundler to resolve and is copied next to the module that imports it, so the relative specifier stays valid in
 * both output formats.
 */
function keepStylesheets() {
    const assets = new Map();
    return {
        name: 'keep-stylesheets',
        resolveId(source, importer) {
            if (!source.endsWith('.css') || !importer || !source.startsWith('.')) return null;
            const absolute = path.resolve(path.dirname(importer), source);
            assets.set(path.relative(import.meta.dirname, absolute), absolute);
            // The absolute path, so Rollup writes the import relative to the module that holds it.
            return { id: absolute, external: true };
        },
        generateBundle() {
            for (const [fileName, absolute] of assets) {
                this.emitFile({ type: 'asset', fileName, source: readFileSync(absolute) });
            }
        }
    };
}

const configuration = rollup(cjsPath, esmPath, tsconfigPath, pkg);

// Every module is an entry, so a host can import any of them by path; the fake host of the stories is published as `./testing`.
configuration.input = globSync('**/*.{ts,tsx}', {
    cwd: import.meta.dirname,
    ignore: ['**/node_modules/**', '**/dist/**', '**/for_*/**', '**/given/**', '**/*.d.ts', '**/*.stories.*', 'vitest.setup.ts', 'vite.config.mts', 'rollup.config.mjs', '.storybook/**'],
});

// A dependency is external with its subpaths too (`@cratis/scene.editor/ScreenEditor/Host/createScreenEditorEnvironment`).
const escaped = name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
configuration.external = [
    ...configuration.external,
    ...[...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})].map(name => new RegExp(`^${escaped(name)}(/|$)`)),
];
configuration.plugins = [keepStylesheets(), ...configuration.plugins];

export default configuration;
