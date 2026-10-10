// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { cratisComponentsRuntimePackage } from '../cratisComponentsRuntimePackage';

/**
 * A bundle content check over the built output: every module reachable from the published `./runtime` entry,
 * through static and dynamic imports, is collected, and none of them may be a designer, editor, design-time
 * action or the design-time bundle. A runtime host that imports `@cratis/scene.components/runtime` therefore
 * loads none of them.
 */
const distribution = join(import.meta.dirname, '../dist/esm');
const importPattern = /(?:^|[\s;])(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|^import\s*['"]([^'"]+)['"]/gm;
const designTimeModules = [
    'designTime/cratisComponentsDesignTime.js',
    'forms/CommandFormDesigner.js',
    'forms/CommandFieldPropertyEditor.js',
    'forms/CommandFormLayoutEditor.js',
    'forms/generateCommandFieldsAction.js',
];

function reachableModules(entry: string): string[] {
    const seen = new Set<string>();
    const pending = [entry];
    while (pending.length > 0) {
        const module = pending.pop()!;
        if (seen.has(module)) continue;
        seen.add(module);
        for (const match of readFileSync(module, 'utf-8').matchAll(importPattern)) {
            const specifier = match[1] ?? match[2] ?? match[3];
            if (!specifier.startsWith('.')) continue;
            const base = join(dirname(module), specifier);
            const resolved = [base, `${base}.js`, join(base, 'index.js')].find(candidate => candidate.endsWith('.js') && existsSync(candidate));
            if (resolved) pending.push(resolved);
        }
    }

    return [...seen].map(module => relative(distribution, module)).sort();
}

describe('when checking the built runtime entry of the components package for design-time code', () => {
    const runtime = reachableModules(join(distribution, 'runtime.js'));
    const full = reachableModules(join(distribution, 'index.js'));

    it('should reach the components, descriptors and manifest', () =>
        runtime.should.include.members(['runtime.js', 'cratisComponents.js', 'cratisComponentsDescriptors.js', 'cratisComponentsPackageManifest.js', 'cratisComponentsRuntimePackage.js']));

    it('should reach no design-time module', () => runtime.filter(module => designTimeModules.includes(module)).should.deep.equal([]));

    it('should still reach every design-time module from the full entry', () => full.should.include.members(designTimeModules));

    it('should export a runtime bundle without design-time contributions', () =>
        (cratisComponentsRuntimePackage.designTime === undefined).should.equal(true));
});
