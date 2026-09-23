// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Defines the size a deployment target assumes by default.
 *
 * Deliberately a different vocabulary from {@link WidthSizeClass} and {@link HeightSizeClass}. Those two form
 * the matrix an arrangement resolves against, where the only distinction that matters is whether an axis is
 * cramped. What a target assumes is a coarser, one-dimensional statement about the device - a desktop is not
 * merely 'regular' - and it carries a third value because of it.
 */
export enum TargetSizeClass {
    Compact = 'Compact',
    Regular = 'Regular',
    Expanded = 'Expanded'
}
