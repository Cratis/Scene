// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';

/**
 * The text an action shows: a literal, a localization key, or a binding resolved when the action runs. Exactly
 * one is set.
 */
export interface InteractionMessage {
    text?: string;
    stringsKey?: string;
    binding?: BindingExpression;
}

export const InteractionMessagePropertyNames: (keyof InteractionMessage)[] = ['text', 'stringsKey', 'binding'];
