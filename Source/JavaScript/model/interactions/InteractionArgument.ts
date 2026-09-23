// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';

/**
 * One argument passed to an action.
 */
export interface InteractionArgument {
    name: string;
    value: BindingExpression;
}

export const InteractionArgumentPropertyNames: (keyof InteractionArgument)[] = ['name', 'value'];
