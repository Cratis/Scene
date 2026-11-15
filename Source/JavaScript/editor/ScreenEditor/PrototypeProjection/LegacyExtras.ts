// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a legacy element held that the Scene element has no place for. It is carried on the element and merged back when
// the screen is projected for the readers that still draw the earlier shape, so converting never loses state.
export interface LegacyExtras {

    // Fields at the top of the element that Scene has no equivalent for, or maps only approximately (visibility,
    // opacity, margin, alignments, min and max sizes, anchoring, category, library ...), exactly as stored.
    top: Record<string, unknown>;

    // Component specific fields that were stored at the top of the element rather than in its properties.
    topKeys: string[];

    // The keys of the stored canvas position other than x and y.
    canvas: Record<string, unknown>;

    // The stored position, kept because a flowing layout has no canvas placement to carry it.
    position: { x: number; y: number };

    // Slots other than the children.
    slots: Record<string, unknown>;

    // The element had no name of its own, so the type stood in for it.
    emptyName: boolean;
}
