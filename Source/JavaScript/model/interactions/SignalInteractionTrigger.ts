// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionTrigger } from './InteractionTrigger';

/**
 * An interaction started by an extension component raising a signal its contract declares (`on <signal>`).
 *
 * The signal belongs to the component the behavior is attached to, so the name is not qualified. It is a different
 * concept from an application trigger, which a declared `trigger <Name>` names and a backend reaction can consume.
 */
export interface SignalInteractionTrigger extends InteractionTrigger {
    signalName: string;
}

export const SignalInteractionTriggerPropertyNames: (keyof SignalInteractionTrigger)[] = ['signalName'];
