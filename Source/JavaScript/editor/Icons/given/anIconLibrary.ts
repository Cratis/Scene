// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry, PackageKind } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';

export interface AnIconLibraryOptions {
    version?: string;
    variants?: string[];
}

// The smallest icon library a spec can add, remove and upgrade: the given icon keys, each named after its
// key, with an adapter that draws every key. Two of these with the same keys are two libraries that both
// ship, say, `home`.
export function anIconLibrary(name: string, keys: string[], { version = '1.0.0', variants = [] }: AnIconLibraryOptions = {}): ScenePackageBundle {
    const entries: IconEntry[] = keys.map(key => ({ key, name: key.replace(/^./, first => first.toUpperCase()), categories: ['Places'], variants: variants.length > 0 ? variants : undefined }));
    const glyph = () => null;

    return {
        manifest: {
            name,
            version,
            kind: PackageKind.IconLibrary,
            dependencies: [],
            components: [],
            layouts: [],
            screenTemplates: [],
            dialogTemplates: [],
            themes: [],
            displayName: name,
            iconLibrary: { variants, renderers: ['react'], iconCount: keys.length },
        },
        components: {},
        iconLibrary: {
            catalog: { library: name, loadEntries: async () => entries },
            adapter: { library: name, loadGlyph: () => glyph },
        },
    };
}
