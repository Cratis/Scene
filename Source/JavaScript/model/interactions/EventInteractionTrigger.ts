// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionTrigger } from './InteractionTrigger';

/**
 * An interaction started by observing a modeled domain event.
 */
export interface EventInteractionTrigger extends InteractionTrigger {
    eventName: string;
}

export const EventInteractionTriggerPropertyNames: (keyof EventInteractionTrigger)[] = ['eventName'];
