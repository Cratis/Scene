// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionTrigger } from './InteractionTrigger';

/**
 * An interaction started by a declared application trigger firing.
 */
export interface ApplicationTriggerInteractionTrigger extends InteractionTrigger {
    triggerName: string;
}

export const ApplicationTriggerInteractionTriggerPropertyNames: (keyof ApplicationTriggerInteractionTrigger)[] = ['triggerName'];
