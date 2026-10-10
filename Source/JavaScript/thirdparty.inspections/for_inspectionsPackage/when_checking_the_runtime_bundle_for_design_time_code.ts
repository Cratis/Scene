// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

/**
 * A bundle content check over the built output, not the source: every module a runtime host loads when it
 * imports the package entry point is followed through its static and dynamic imports, and none of them may
 * be design-time code. A runtime host that imports the package therefore loads no designer, editor, preview,
 * display or action - the separation is a property of what ships, not a convention someone has to keep.
 */
const distribution = join(import.meta.dirname, '../dist/esm');
const importPattern = /(?:^|[\s;])(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|^import\s*['"]([^'"]+)['"]/gm;

function resolveModule(from: string, specifier: string): string | undefined {
    if (!specifier.startsWith('.')) return undefined;
    const base = join(dirname(from), specifier);
    return [base, `${base}.js`, join(base, 'index.js')].find(candidate => candidate.endsWith('.js') && existsSync(candidate));
}

function reachableModules(entry: string): string[] {
    const seen = new Set<string>();
    const pending = [entry];
    while (pending.length > 0) {
        const module = pending.pop()!;
        if (seen.has(module)) continue;
        seen.add(module);
        for (const match of readFileSync(module, 'utf-8').matchAll(importPattern)) {
            const resolved = resolveModule(module, match[1] ?? match[2] ?? match[3]);
            if (resolved) pending.push(resolved);
        }
    }

    return [...seen].map(module => relative(distribution, module)).sort();
}

describe('when checking the runtime bundle for design-time code', () => {
    const runtime = reachableModules(join(distribution, 'index.js'));
    const designTime = reachableModules(join(distribution, 'designTime/index.js'));

    it('should follow the runtime entry to its component and descriptors', () =>
        runtime.should.include.members(['index.js', 'inspectionsPackage.js', 'InspectionChecklist.js', 'inspectionsDescriptors.js']));

    it('should reach no design-time module from the runtime entry', () =>
        runtime.filter(module => module.startsWith('designTime/')).should.deep.equal([]));

    it('should reach every design-time contribution from the design-time entry', () =>
        designTime.should.include.members([
            'designTime/ChecklistPreview.js',
            'designTime/ChecklistDesigner.js',
            'designTime/ChecklistItemsEditor.js',
            'designTime/SeverityBadge.js',
            'designTime/generateChecklistItemsAction.js',
        ]));

    it('should carry no design-time contributions in the runtime bundle object', async () => {
        const { inspectionsPackage } = await import('../index');
        (inspectionsPackage.designTime === undefined).should.equal(true);
    });
});
