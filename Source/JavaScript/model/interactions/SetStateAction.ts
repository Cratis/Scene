// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';
import { InteractionAction } from './InteractionAction';

/**
 * Writes screen state.
 */
export interface SetStateAction extends InteractionAction {
    target: string;
    value: BindingExpression;
}

export const SetStateActionPropertyNames: (keyof SetStateAction)[] = ['target', 'value', 'kind'];
