// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';
import { InteractionMessage } from './InteractionMessage';

/**
 * Gates the actions that follow on the user agreeing.
 */
export interface ConfirmAction extends InteractionAction {
    message: InteractionMessage;
}

export const ConfirmActionPropertyNames: (keyof ConfirmAction)[] = ['message', 'kind'];
