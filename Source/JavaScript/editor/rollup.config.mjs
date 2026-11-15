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
 * The editor's components import their own stylesheets (`import './X.css'`) and the Lucide icon catalog is loaded as a
 * JSON module. Neither is part of the JavaScript graph: each stays an import for the consuming bundler to resolve and is
 * copied next to the module that imports it, so the relative specifier stays valid in both output formats.
 */
function keepStaticAssets() {
    const assets = new Map();
    return {
        name: 'keep-static-assets',
        resolveId(source, importer) {
            if (!/\.(css|json)$/.test(source) || !importer || !source.startsWith('.')) return null;
            const absolute = path.resolve(path.dirname(importer), source);
            assets.set(path.relative(import.meta.dirname, absolute), absolute);
            return { id: source, external: true };
        },
        generateBundle() {
            for (const [fileName, absolute] of assets) {
                this.emitFile({ type: 'asset', fileName, source: readFileSync(absolute) });
            }
        }
    };
}

const configuration = rollup(cjsPath, esmPath, tsconfigPath, pkg);

// Every module is an entry, so a host can import any of them by path (`@cratis/scene.editor/UiProfile/resolveUiProfile`).
// The fixtures a host's own specifications build on (`ScreenTemplates/given`) are published; the editor's own are not.
configuration.input = globSync('**/*.{ts,tsx}', {
    cwd: import.meta.dirname,
    ignore: ['**/node_modules/**', '**/dist/**', '**/for_*/**', '**/*.d.ts', '**/*.stories.*', 'vitest.setup.ts', 'vite.config.mts', 'rollup.config.mjs'],
}).filter(file => !/(^|\/)given\//.test(file) || file.startsWith('ScreenTemplates/given/'));

// A dependency is external with its subpaths too (`react-icons/fa`, `@cratis/scene.primereact/quill`, `@cratis/scene.components/styles`).
const escaped = name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
configuration.external = [
    ...configuration.external,
    ...[...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})].map(name => new RegExp(`^${escaped(name)}(/|$)`)),
];
configuration.plugins = [keepStaticAssets(), ...configuration.plugins];

export default configuration;
