// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';

/**
 * Changes the active screen. The screen is named, never addressed - turning that into a URL is a renderer's job.
 */
export interface NavigateAction extends InteractionAction {
    screen: string;
}

export const NavigateActionPropertyNames: (keyof NavigateAction)[] = ['screen', 'kind'];
