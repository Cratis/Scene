// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry, PackageKind, ScenePackage } from '@cratis/scene.model';
import { EffectiveIconCatalog } from '../EffectiveIconCatalog';
import { IconCatalogSource } from '../IconCatalogSource';
import { resolveIconLibraries } from '../resolveIconLibraries';

/**
 * Two synthetic providers that both ship an icon called `home` - different artwork, different
 * categories, same key - so every spec can prove same-named icons stay distinct.
 */
export const alphaName = '@fixtures/icons.alpha';
export const betaName = '@fixtures/icons.beta';

function iconLibrary(name: string, version: string, variants: string[], dependencies: ScenePackage['dependencies'] = []): ScenePackage {
    return {
        name,
        version,
        kind: PackageKind.IconLibrary,
        dependencies,
        components: [],
        layouts: [],
        screenTemplates: [],
        dialogTemplates: [],
        themes: [],
        license: 'MIT',
        iconLibrary: { variants, renderers: ['react'], attribution: `Icons by ${name}`, iconCount: 2 },
    };
}

export const alpha = iconLibrary(alphaName, '1.2.0', ['outline', 'solid']);
export const beta = iconLibrary(betaName, '2.0.0', []);

export const componentsNeedingAlpha: ScenePackage = {
    name: '@fixtures/components',
    version: '1.0.0',
    kind: PackageKind.ComponentLibrary,
    dependencies: [{ name: alphaName, versionRange: '^1.0.0' }],
    components: ['button'],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
};

export const componentsNeedingNewerBeta: ScenePackage = {
    ...componentsNeedingAlpha,
    name: '@fixtures/components.strict',
    dependencies: [{ name: betaName, versionRange: '^3.0.0' }],
};

export const alphaEntries: IconEntry[] = [
    { key: 'home', name: 'Home', categories: ['Navigation'], variants: ['outline', 'solid'] },
    { key: 'trash', name: 'Trash', categories: ['Actions'], aliases: ['bin', 'delete'], tags: ['remove'], variants: ['outline', 'solid'] },
];

export const betaEntries: IconEntry[] = [
    { key: 'home', name: 'Home', categories: ['Buildings'] },
    { key: 'bin', name: 'Bin', categories: ['Actions'], tags: ['rubbish'] },
];

export const catalog: ScenePackage[] = [alpha, beta, componentsNeedingAlpha, componentsNeedingNewerBeta];

/**
 * A catalog source that counts how often it was asked to load, so specs can prove laziness.
 */
export function countingSource(library: string, entries: IconEntry[]): IconCatalogSource & { loads: number } {
    const source = {
        library,
        loads: 0,
        loadEntries: async () => {
            source.loads++;
            return entries;
        },
    };

    return source;
}

export function openCatalog(selected: string[], sources: IconCatalogSource[], packages: ScenePackage[] = catalog): EffectiveIconCatalog {
    return new EffectiveIconCatalog(resolveIconLibraries(selected, packages), sources);
}

export function defaultSources(): (IconCatalogSource & { loads: number })[] {
    return [countingSource(alphaName, alphaEntries), countingSource(betaName, betaEntries)];
}
