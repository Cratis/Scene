// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';

/**
 * Supplies one query parameter from a value already available where the query is used.
 */
export interface QueryArgumentBinding {
    /** The query parameter being supplied. */
    parameter: string;

    /** Where the value comes from. */
    source: BindingExpression;
}

export const QueryArgumentBindingPropertyNames: (keyof QueryArgumentBinding)[] = ['parameter', 'source'];
