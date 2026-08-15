// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateSource } from './PopulateSource';
import { BindingExpression } from '../common';

/**
 * Populates a {@link Form}'s initial values from an item already in scope (e.g. a row selected in a
 * table on the same screen), rather than a fresh query.
 */
export interface PopulateFromItem extends PopulateSource {
    itemBinding: BindingExpression;
}

export const PopulateFromItemPropertyNames: (keyof PopulateFromItem)[] = ['itemBinding'];
