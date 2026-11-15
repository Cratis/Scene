// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentType } from 'react';
import type { LayoutContainerDescriptor } from './LayoutContainerDescriptor';
import type { LayoutCatalogEntry } from './LayoutCatalogEntry';
import type { LayoutItem } from './LayoutItem';

// The labels for each layout choice come from the host's localization, never from the catalog.
export type LayoutLabels = Record<LayoutItem, string>;

// The icon each layout choice shows on its toolbar button.
export type LayoutIcons = Record<LayoutItem, ComponentType<{ className?: string }>>;

// Turns the catalog into what the editing surface registers, labelling and decorating each entry with the host's text and icons.
export function toLayoutContainerDescriptors(catalog: readonly LayoutCatalogEntry[], labels: LayoutLabels, icons?: LayoutIcons): LayoutContainerDescriptor[] {
    return catalog.map(entry => ({ type: entry.type, name: labels[entry.item], arrangement: entry.arrangement, icon: icons?.[entry.item] }));
}
