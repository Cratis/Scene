// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidth, FormWidthUnit } from '@cratis/scene.model';

/**
 * Parses a legacy width token into typed form geometry. Arbitrary strings are intentionally rejected.
 */
export function parseFormWidth(value: unknown): FormWidth | undefined {
    if (!value || typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed === 'auto') return { unit: FormWidthUnit.Auto };
    const match = /^([0-9]+(?:\.[0-9]+)?)(fr|px|%)$/.exec(trimmed);
    if (!match) return undefined;
    const widthValue = Number(match[1]);
    if (!Number.isFinite(widthValue) || widthValue < 0) return undefined;
    if (match[2] === 'fr') return { unit: FormWidthUnit.Fraction, value: widthValue };
    if (match[2] === 'px') return { unit: FormWidthUnit.Pixels, value: widthValue };
    return { unit: FormWidthUnit.Percent, value: widthValue };
}
