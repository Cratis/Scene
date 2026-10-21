// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(__dirname, '..');
const forbidden = /(?:from|import)\s*\(?\s*['"](?:primereact|@primereact\/|@primeuix\/|primeicons|@cratis\/scene\.primereact)/;
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { name: string; dependencies?: Record<string, string>; peerDependencies?: Record<string, string>; peerDependenciesMeta?: Record<string, { optional?: boolean }> };
const isWidgetPackage = (name: string) => /^(primereact|@primereact\/|@primeuix\/|primeicons|@cratis\/scene\.primereact)/.test(name);

// What ships is what a consumer installs: files that are packed (not specs, stories or Storybook scaffolding) must not import PrimeReact.
const shipped = (path: string): string[] => readdirSync(path).flatMap(entry => {
    const full = join(path, entry);
    const name = relative(root, full);
    if (['node_modules', 'dist', 'storybook-static', '.storybook'].includes(entry) || entry.startsWith('for_') || /\.stories\./.test(entry) || entry.startsWith('PrimeReactStoryProvider')) return [];
    return statSync(full).isDirectory() ? shipped(full) : /\.(ts|tsx)$/.test(entry) ? [name] : [];
});

describe('when installing without primereact', () => {
    it('should not list a widget package as a dependency', () => Object.keys(packageJson.dependencies ?? {}).filter(isWidgetPackage).should.deep.equal([]));
    it('should list a widget package only as an optional peer', () => Object.keys(packageJson.peerDependencies ?? {}).filter(isWidgetPackage).filter(name => packageJson.peerDependenciesMeta?.[name]?.optional !== true).should.deep.equal([]));
    it('should not import a widget package from any shipped source file', () => shipped(root).filter(file => forbidden.test(readFileSync(join(root, file), 'utf8'))).should.deep.equal([]));

    it('should declare every bare import of a shipped source file as a dependency or peer', () => {
        const declared = new Set([packageJson.name, ...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.peerDependencies ?? {})]);
        const packageOf = (specifier: string) => specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
        const undeclared = shipped(root).flatMap(file =>
            [...readFileSync(join(root, file), 'utf8').matchAll(/^(?:import|export)\s[^;'"]*?from\s*['"]([^'".][^'"]*)['"]|^import\s*['"]([^'".][^'"]*)['"]/gm)]
                .map(match => packageOf(match[1] ?? match[2]))
                .filter(name => !declared.has(name) && !name.startsWith('node:')));
        [...new Set(undeclared)].should.deep.equal([]);
    });

    it('should peer-depend on @cratis/components and the Arc packages it loads, not bundle its own copy', () => {
        Object.keys(packageJson.dependencies ?? {}).should.not.include('@cratis/components');
        ['@cratis/components', '@cratis/arc', '@cratis/arc.react', '@cratis/fundamentals', 'reflect-metadata'].filter(name => !(name in (packageJson.peerDependencies ?? {}))).should.deep.equal([]);
    });
});
