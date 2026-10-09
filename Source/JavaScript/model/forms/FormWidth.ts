// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidthUnit } from './FormWidthUnit';

/**
 * A platform-neutral width value for form geometry.
 */
export interface FormWidth {
    unit: FormWidthUnit;

    /** The numeric value for fraction, pixel and percent widths. Omitted for `auto`. */
    value?: number;
}

export const FormWidthPropertyNames: (keyof FormWidth)[] = ['unit', 'value'];
