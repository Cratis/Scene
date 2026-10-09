// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormColumn, FormFieldPlacement, FormWidth, FormWidthUnit } from '@cratis/scene.model';
import { defaultCommandFormLayout } from './defaultCommandFormLayout';
import { parseFormWidth } from './parseFormWidth';

export interface LegacyCommandFormInputGeometry {
    property: string;
    column?: number;
    width?: string;
}

/**
 * Normalizes authored command form layout, including legacy per-input column/width metadata.
 */
export function normalizeCommandFormLayout(layout: CommandFormLayout | undefined, inputs: readonly LegacyCommandFormInputGeometry[] = []): CommandFormLayout {
    if (layout) return layout;
    if (!inputs.length) return defaultCommandFormLayout;
    const placements = inputs.map((input, index): FormFieldPlacement => ({
        field: input.property,
        row: index + 1,
        column: positiveInteger(input.column) ?? 1,
        width: parseFormWidth(input.width),
    }));
    const columnCount = Math.max(1, ...placements.map(placement => placement.column));
    return {
        columns: Array.from({ length: columnCount }, (_, index): FormColumn => ({ index: index + 1, width: fraction(1) })),
        placements,
    };
}

function fraction(value: number): FormWidth {
    return { unit: FormWidthUnit.Fraction, value };
}

function positiveInteger(value: number | undefined): number | undefined {
    return value !== undefined && Number.isInteger(value) && value > 0 ? value : undefined;
}
