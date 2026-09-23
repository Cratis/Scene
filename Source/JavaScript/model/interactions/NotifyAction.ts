// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';
import { InteractionMessage } from './InteractionMessage';
import { NotificationLevel } from './NotificationLevel';

/**
 * Surfaces a message.
 */
export interface NotifyAction extends InteractionAction {
    level: NotificationLevel;
    message: InteractionMessage;
}

export const NotifyActionPropertyNames: (keyof NotifyAction)[] = ['level', 'message'];
