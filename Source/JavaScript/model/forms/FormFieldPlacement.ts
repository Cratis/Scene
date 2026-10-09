// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidth } from './FormWidth';

/**
 * Authored placement for one command-form field in a platform-neutral grid. Row and column are one-based.
 */
export interface FormFieldPlacement {
    field: string;
    row: number;
    column: number;
    rowSpan?: number;
    columnSpan?: number;
    width?: FormWidth;
}

export const FormFieldPlacementPropertyNames: (keyof FormFieldPlacement)[] = ['field', 'row', 'column', 'rowSpan', 'columnSpan', 'width'];
