// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerCatalog, IconPickerEntry, IconPickerLibrary } from '@cratis/components/IconPicker';
import { EffectiveIconCatalog, EffectiveIconEntry } from '@cratis/scene.engine';
import { IconAdapterRegistry, SceneIcon } from '@cratis/scene.react';
import { IconPickerCatalogState } from './IconPickerCatalogState';

// The size, in pixels, a preview glyph is drawn at.
const previewSize = 24;

function libraryOf(catalog: EffectiveIconCatalog): IconPickerLibrary[] {
    return catalog.libraries.map(resolved => ({
        id: resolved.library,
        name: resolved.package.displayName ?? resolved.package.name,
        version: resolved.package.version,
        attribution: resolved.package.iconLibrary?.attribution,
    }));
}

function entriesOf(entries: EffectiveIconEntry[], adapters: IconAdapterRegistry | undefined): IconPickerEntry[] {
    return entries.flatMap(effective =>
        effective.references.map(reference => ({
            library: reference.library,
            key: reference.key,
            ...(reference.variant === undefined ? {} : { variant: reference.variant }),
            name: effective.entry.name,
            categories: effective.entry.categories,
            tags: effective.entry.tags,
            aliases: effective.entry.aliases,
            renderPreview: () => <SceneIcon reference={reference} adapters={adapters} size={previewSize} />,
        })),
    );
}

// Adapts Scene's effective icon catalog into the catalog Cratis Components' icon picker browses.
//
// The qualified identity goes straight through: an entry's `library`, `key` and `variant` are the
// reference's own, one entry per variant, so what the picker emits is exactly what Scene resolves and
// stores. Two libraries that both ship `home` stay two entries, told apart by their library. Previews
// are drawn lazily through `SceneIcon`, which the picker only calls for tiles near the viewport.
export function toIconPickerCatalog(
    catalog: EffectiveIconCatalog,
    entries: EffectiveIconEntry[],
    adapters?: IconAdapterRegistry,
    state: IconPickerCatalogState = { status: 'ready' },
): IconPickerCatalog {
    return {
        libraries: libraryOf(catalog),
        icons: entriesOf(entries, adapters),
        status: state.status,
        error: state.error,
    };
}
