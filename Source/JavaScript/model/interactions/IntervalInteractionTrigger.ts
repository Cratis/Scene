// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionTrigger } from './InteractionTrigger';

/**
 * An interaction started by an elapsed interval, normalized to seconds so nothing downstream carries a unit.
 */
export interface IntervalInteractionTrigger extends InteractionTrigger {
    seconds: number;
}

export const IntervalInteractionTriggerPropertyNames: (keyof IntervalInteractionTrigger)[] = ['seconds'];
