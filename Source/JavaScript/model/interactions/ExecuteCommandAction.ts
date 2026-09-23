// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';

/**
 * Submits a modeled command.
 */
export interface ExecuteCommandAction extends InteractionAction {
    command: string;
}

export const ExecuteCommandActionPropertyNames: (keyof ExecuteCommandAction)[] = ['command', 'kind'];
