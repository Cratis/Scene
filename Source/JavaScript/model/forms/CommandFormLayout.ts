// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormColumn } from './FormColumn';
import { FormFieldPlacement } from './FormFieldPlacement';
import { FormWidth } from './FormWidth';

/**
 * Platform-neutral command-form geometry. It is independent of auto/manual field generation mode.
 */
export interface CommandFormLayout {
    columns: FormColumn[];
    placements: FormFieldPlacement[];
    columnGap?: FormWidth;
    rowGap?: FormWidth;
}

export const CommandFormLayoutPropertyNames: (keyof CommandFormLayout)[] = ['columns', 'placements', 'columnGap', 'rowGap'];
