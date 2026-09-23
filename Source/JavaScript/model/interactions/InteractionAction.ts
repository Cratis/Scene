// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionArgument } from './InteractionArgument';

/**
 * One declarative effect inside a binding.
 *
 * The set is closed and every operand references something the model declares rather than being a string a
 * renderer interprets - that is what lets an action naming nothing be reported instead of becoming a control
 * that does nothing when clicked.
 */
export interface InteractionAction {
    arguments: InteractionArgument[];
    onSuccess: InteractionAction[];
    onFailure: InteractionAction[];
    onResult: InteractionAction[];
}

export const InteractionActionPropertyNames: (keyof InteractionAction)[] = ['arguments', 'onSuccess', 'onFailure', 'onResult'];
