// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Control } from './Control';
import { SceneElement } from './SceneElement';

/**
 * A {@link Control} that hosts a single piece of content.
 */
export interface ContentControl extends Control {
    content: SceneElement;
}

export const ContentControlPropertyNames: (keyof ContentControl)[] = ['content'];
