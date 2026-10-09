// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidth } from './FormWidth';

/**
 * One column in a command-form geometry grid. Indexes are one-based for authored stability.
 */
export interface FormColumn {
    index: number;
    width?: FormWidth;
    minWidth?: FormWidth;
    maxWidth?: FormWidth;
}

export const FormColumnPropertyNames: (keyof FormColumn)[] = ['index', 'width', 'minWidth', 'maxWidth'];
