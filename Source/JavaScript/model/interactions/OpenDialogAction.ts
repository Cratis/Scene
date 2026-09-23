// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';

/**
 * Opens a dialog over the application.
 */
export interface OpenDialogAction extends InteractionAction {
    dialogTemplate: string;
}

export const OpenDialogActionPropertyNames: (keyof OpenDialogAction)[] = ['dialogTemplate', 'kind'];
