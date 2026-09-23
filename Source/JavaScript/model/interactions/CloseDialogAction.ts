// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';

/**
 * Dismisses the innermost dialog.
 */
export interface CloseDialogAction extends InteractionAction {}

export const CloseDialogActionPropertyNames: (keyof CloseDialogAction)[] = ['kind'];
