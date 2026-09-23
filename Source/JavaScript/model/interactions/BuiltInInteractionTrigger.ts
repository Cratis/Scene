// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionTrigger } from './InteractionTrigger';
import { InteractionTriggerKind } from './InteractionTriggerKind';

/**
 * One of the built-in interaction kinds.
 */
export interface BuiltInInteractionTrigger extends InteractionTrigger {
    kind: InteractionTriggerKind;
}

export const BuiltInInteractionTriggerPropertyNames: (keyof BuiltInInteractionTrigger)[] = ['kind'];
