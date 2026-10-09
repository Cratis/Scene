// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidth, FormWidthUnit } from '@cratis/scene.model';

/**
 * Converts a platform-neutral form width to a browser CSS width token.
 */
export function formWidthToCss(width: FormWidth | undefined): string | undefined {
    if (!width) return undefined;
    switch (width.unit) {
        case FormWidthUnit.Auto:
            return 'auto';
        case FormWidthUnit.Fraction:
            return `${width.value ?? 1}fr`;
        case FormWidthUnit.Pixels:
            return `${width.value ?? 0}px`;
        case FormWidthUnit.Percent:
            return `${width.value ?? 0}%`;
    }
}
