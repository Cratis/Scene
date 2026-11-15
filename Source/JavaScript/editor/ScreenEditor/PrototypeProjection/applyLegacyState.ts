// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';

const oneOf = <T extends string>(allowed: Record<string, T>, value: unknown): T | undefined =>
    typeof value === 'string' ? Object.values(allowed).find(candidate => candidate === value) : undefined;

const isMargin = (value: unknown): value is { left: number; top: number; right: number; bottom: number } => {
    const margin = value as Record<string, unknown> | null;
    return !!margin && typeof margin === 'object' && ['left', 'top', 'right', 'bottom'].every(side => typeof margin[side] === 'number');
};

// Gives a converted element the state the legacy element held where Scene has a field with the same meaning, so it is drawn
// as it was. Anything Scene would not recognize is left to the extras, which project back unchanged.
export function applyLegacyState(element: object, top: Record<string, unknown>, zIndex: number): void {
    const target = element as Record<string, unknown>;
    target.zIndex = zIndex;

    const visibility = oneOf(Visibility, top.visibility);
    if (visibility !== undefined) target.visibility = visibility;
    if (typeof top.isEnabled === 'boolean') target.isEnabled = top.isEnabled;
    if (typeof top.opacity === 'number') target.opacity = top.opacity;
    if (isMargin(top.margin)) target.margin = { ...top.margin };

    const horizontal = oneOf(HorizontalAlignment, top.horizontalAlignment);
    if (horizontal !== undefined) target.horizontalAlignment = horizontal;
    const vertical = oneOf(VerticalAlignment, top.verticalAlignment);
    if (vertical !== undefined) target.verticalAlignment = vertical;
}

const defaults = { visibility: Visibility.Visible, isEnabled: true, opacity: 1, margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch };

// The state fields a Scene element holds that the legacy element also has, as applyLegacyState would leave them for these stored fields.
export function appliedState(top: Record<string, unknown>): Record<string, unknown> {
    const probe: Record<string, unknown> = { ...defaults, margin: { ...defaults.margin } };
    applyLegacyState(probe, top, 0);
    delete probe.zIndex;
    return probe;
}

export const stateFields = Object.keys(defaults);
