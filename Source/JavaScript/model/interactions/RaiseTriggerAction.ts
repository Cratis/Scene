// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';

/**
 * Fires a declared application trigger.
 */
export interface RaiseTriggerAction extends InteractionAction {
    trigger: string;
}

export const RaiseTriggerActionPropertyNames: (keyof RaiseTriggerAction)[] = ['trigger', 'kind'];
