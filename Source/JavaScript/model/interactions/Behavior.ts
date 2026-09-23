// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionBinding } from './InteractionBinding';

/**
 * A bundle of interaction trigger to action bindings, attached to something that can be interacted with.
 *
 * A named behavior and an inline one are the same shape - anonymity is a property rather than a separate kind
 * of node. Attachments are additive: a behavior on a template and one on an element both run, outermost first,
 * unless the order says otherwise.
 */
export interface Behavior {
    name?: string;
    bindings: InteractionBinding[];
    order?: number;
}

export const BehaviorPropertyNames: (keyof Behavior)[] = ['name', 'bindings', 'order'];
