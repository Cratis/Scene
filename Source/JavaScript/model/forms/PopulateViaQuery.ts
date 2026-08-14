// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateSource } from './PopulateSource';
import { BindingExpression } from '../common';

/**
 * Populates a {@link Form}'s initial values from a single typed query, resolved by name.
 */
export interface PopulateViaQuery extends PopulateSource {
    queryName: string;
    parameterBindings: Record<string, BindingExpression>;
}

export const PopulateViaQueryPropertyNames: (keyof PopulateViaQuery)[] = ['queryName', 'parameterBindings'];
