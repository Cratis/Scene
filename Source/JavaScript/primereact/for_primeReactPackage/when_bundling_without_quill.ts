// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// @vitest-environment node

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { build, Plugin } from 'esbuild';

const packageRoot = resolve(import.meta.dirname, '..');
const packageManifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as { exports: Record<string, unknown>; peerDependenciesMeta: Record<string, { optional: boolean }> };

/** A host that did not install `quill`: every attempt to resolve it fails the way a bundler's does. */
const withoutQuill: Plugin = {
    name: 'without-quill',
    setup(host) {
        host.onResolve({ filter: /^quill($|\/)/ }, args => ({ errors: [{ text: `Could not resolve "${args.path}"` }] }));
    },
};

async function bundle(entry: string, plugins: Plugin[]) {
    return build({
        stdin: { contents: `import * as entry from '${entry}'; console.log(Object.keys(entry).length);`, resolveDir: packageRoot, loader: 'ts', sourcefile: 'consumer.ts' },
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'browser',
        jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'silent',
        plugins,
    });
}

function sources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        if (entry.isDirectory()) return /^(dist|node_modules|storybook-static|\.storybook|for_.*)$/.test(entry.name) ? [] : sources(join(directory, entry.name));
        return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.stories.tsx') ? [join(directory, entry.name)] : [];
    });
}

describe('when bundling without quill', () => {
    it('should build a host that renders no rich text, from the package root, with no quill anywhere', async () => {
        const result = await bundle('./index', [withoutQuill]);
        result.errors.should.deep.equal([]);
        result.outputFiles.should.have.lengthOf(1);
    });

    it('should name quill in exactly one entry point, and that is not the root', async () => {
        const naming = sources(packageRoot).filter(file => /(from\s+|import\()\s*['"]quill['"]/.test(readFileSync(file, 'utf8'))).map(file => relative(packageRoot, file));
        naming.should.deep.equal(['loadQuill/index.ts']);
    });

    it('should fail to build the quill entry without quill, which is why a host opts into it explicitly', async () => {
        let failure = '';
        await bundle('./loadQuill', [withoutQuill]).catch((error: Error) => { failure = error.message; });
        failure.should.contain('Could not resolve "quill"');
    });

    it('should build the quill entry once quill is installed, to a loader of the real module', async () => {
        const result = await bundle('./loadQuill', []);
        result.errors.should.deep.equal([]);
    });

    it('should publish the quill entry as its own export, and keep quill an optional peer', () => {
        (packageManifest.exports['./quill'] as object).should.deep.equal({
            types: './dist/esm/loadQuill/index.d.ts',
            require: './dist/cjs/loadQuill/index.js',
            import: './dist/esm/loadQuill/index.js',
        });
        packageManifest.peerDependenciesMeta.quill.optional.should.equal(true);
    });
});
