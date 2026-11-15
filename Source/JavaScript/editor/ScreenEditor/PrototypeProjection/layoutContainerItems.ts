// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutItem } from '../Layouts/LayoutItem';

// The library the Phase A layout containers were registered under. They convert to Scene panels, not components.
export const legacyLayoutLibrary = 'StudioLayout';

const byType: Record<string, LayoutItem> = {
    Stack: LayoutItem.Stack,
    Row: LayoutItem.Row,
    Grid: LayoutItem.Grid,
    Container: LayoutItem.Container,
    Wrap: LayoutItem.Wrap,
    Canvas: LayoutItem.Canvas,
};

// The layout choice a legacy StudioLayout.<Type> element stands for, if it is one.
export function layoutItemOfLegacyType(legacyType: string): LayoutItem | undefined {
    return legacyType.startsWith(`${legacyLayoutLibrary}.`) ? byType[legacyType.slice(legacyLayoutLibrary.length + 1)] : undefined;
}

// The legacy type a layout choice is written back as, the inverse of layoutItemOfLegacyType.
export function legacyTypeOfLayoutItem(item: LayoutItem): string {
    const name = Object.entries(byType).find(([, candidate]) => candidate === item)?.[0] ?? 'Container';
    return `${legacyLayoutLibrary}.${name}`;
}
