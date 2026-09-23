// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';
import { InteractionAction } from './InteractionAction';
import { InteractionTrigger } from './InteractionTrigger';

/**
 * One interaction trigger to actions binding.
 */
export interface InteractionBinding {
    trigger: InteractionTrigger;
    actions: InteractionAction[];
    condition?: BindingExpression;
}

export const InteractionBindingPropertyNames: (keyof InteractionBinding)[] = ['trigger', 'actions', 'condition'];
