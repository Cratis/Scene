// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { browserSpecShards } from './browser-spec-shards.mjs';

const scripts = dirname(fileURLToPath(import.meta.url));
const root = resolve(scripts, '../..');

test('assigns every real browser workspace exactly once across at most three nonempty shards', () => {
    const directory = join(root, 'Source/JavaScript');
    const expected = readdirSync(directory).map(name => JSON.parse(readFileSync(join(directory, name, 'package.json'), 'utf8')))
        .filter(manifest => manifest.scripts?.['test:browser']).map(manifest => manifest.name).sort();
    const shards = browserSpecShards(root);
    const actual = shards.flatMap(shard => shard.workspaces.split(' '));
    assert.ok(expected.length > 0);
    assert.ok(shards.length > 0 && shards.length <= 3);
    assert.equal(new Set(actual).size, actual.length);
    assert.deepEqual(actual.sort(), expected);
    assert.deepEqual(shards.map(shard => shard.shard), [1, 2, 3]);
});

function fixture(t, count = 0) {
    mkdirSync(join(root, '.ai-work/262'), { recursive: true });
    const directory = mkdtempSync(join(root, '.ai-work/262/shards-'));
    t.after(() => rmSync(directory, { recursive: true }));
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ workspaces: ['Source/JavaScript/**/*', '!**/dist/**', '!**/obj/**', '!**/bin/**'] }));
    mkdirSync(join(directory, 'Source/JavaScript'), { recursive: true });
    for (let index = 0; index < count; index++) {
        const workspace = join(directory, `Source/JavaScript/workspace${index}`);
        mkdirSync(workspace);
        writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name: `@test/workspace${index}`, scripts: { 'test:browser': 'vitest' } }));
    }
    return directory;
}

test('uses deterministic greedy balancing and does not create empty shards', t => {
    const directory = fixture(t, 2);
    assert.deepEqual(browserSpecShards(directory), [
        { shard: 1, workspaces: '@test/workspace0' },
        { shard: 2, workspaces: '@test/workspace1' }
    ]);
    assert.deepEqual(browserSpecShards(directory, 1), [{ shard: 1, workspaces: '@test/workspace0 @test/workspace1' }]);
    assert.throws(() => browserSpecShards(directory, 0), /positive integer/);
});

test('discovers nested declared workspaces but not build output or installed dependencies', t => {
    const directory = fixture(t, 1);
    for (const name of ['nested/browser', 'nested/dist/cjs', 'nested/obj/cache', 'nested/bin/Debug', 'node_modules/dependency']) {
        const workspace = join(directory, 'Source/JavaScript', name);
        mkdirSync(workspace, { recursive: true });
        writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name, scripts: { 'test:browser': 'vitest' } }));
    }
    const actual = browserSpecShards(directory).flatMap(shard => shard.workspaces.split(' ')).sort();
    assert.deepEqual(actual, ['@test/workspace0', 'nested/browser']);
});

test('CLI prints compact JSON for the discovered workspaces', () => {
    const result = spawnSync(process.execPath, [join(scripts, 'browser-spec-shards.mjs'), '3'], { encoding: 'utf8' });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), JSON.stringify(browserSpecShards(root)));
});

test('the workflow runs every workspace in a shard and preserves a failure', t => {
    const directory = fixture(t);
    const yarn = join(directory, 'yarn');
    writeFileSync(yarn, '#!/bin/bash\nprintf "%s\\n" "$2" >> "$CALLS"\n[[ "$2" != "$FAILED_WORKSPACE" ]]\n', { mode: 0o755 });
    const workflow = readFileSync(join(root, '.github/workflows/javascript-build.yml'), 'utf8');
    const loop = workflow.match(/        run: \|\n(          failed=\(\)[\s\S]*?)\n\n/)[1].replace(/^          /gm, '');
    for (const failed of ['', '@test/first']) {
        const calls = join(directory, `calls-${failed ? 'failed' : 'passed'}`);
        const result = spawnSync('bash', ['-e', '-c', loop], {
            encoding: 'utf8',
            env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, CALLS: calls, FAILED_WORKSPACE: failed, WORKSPACES: '@test/first @test/second' }
        });
        assert.equal(result.status, failed ? 1 : 0, result.stderr);
        assert.equal(readFileSync(calls, 'utf8'), '@test/first\n@test/second\n');
    }
});

test('CLI fails rather than silently accepting an empty discovery', t => {
    const directory = fixture(t);
    mkdirSync(join(directory, '.github/scripts'), { recursive: true });
    const script = join(directory, '.github/scripts/browser-spec-shards.mjs');
    copyFileSync(join(scripts, 'browser-spec-shards.mjs'), script);
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /No browser specification workspaces found/);
});
