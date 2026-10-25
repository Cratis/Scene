// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

// Local baseline wall-time medians (seconds); replace with CI measurements when available.
const weights = {
    '@cratis/scene.primereact': 31.37,
    '@cratis/scene.blueprint.default': 43.24,
    '@cratis/scene.blueprint.administration': 27.17,
    '@cratis/scene.blueprint.crm': 94.65
};

function browserWorkspaces(root) {
    const { workspaces } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const ignore = ['**/node_modules/**', ...workspaces.filter(pattern => pattern.startsWith('!')).map(pattern => pattern.slice(1))];
    const patterns = workspaces.filter(pattern => !pattern.startsWith('!')).map(pattern => `${pattern}/package.json`);
    return globSync(patterns, { cwd: root, ignore, nodir: true })
        .map(file => JSON.parse(readFileSync(join(root, file), 'utf8')))
        .filter(manifest => manifest.scripts?.['test:browser'])
        .map(manifest => ({ name: manifest.name, weight: weights[manifest.name] ?? 10 }))
        .sort((left, right) => right.weight - left.weight || left.name.localeCompare(right.name));
}

export function browserSpecShards(root, count = 3) {
    if (!Number.isInteger(count) || count < 1) throw new Error('Shard count must be a positive integer');
    const workspaces = browserWorkspaces(root);
    if (!workspaces.length) throw new Error('No browser specification workspaces found');
    const shards = Array.from({ length: Math.min(count, workspaces.length) }, (_, index) => ({ shard: index + 1, workspaces: [], weight: 0 }));
    for (const workspace of workspaces) {
        const lightest = shards.reduce((best, shard) => shard.weight < best.weight ? shard : best);
        lightest.workspaces.push(workspace.name);
        lightest.weight += workspace.weight;
    }
    return shards.map(({ shard, workspaces }) => ({ shard, workspaces: workspaces.join(' ') }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
        console.log(JSON.stringify(browserSpecShards(root, Number(process.argv[2] ?? 3))));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
