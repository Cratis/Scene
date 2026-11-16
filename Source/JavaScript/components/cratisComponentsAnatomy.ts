// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentAnatomy } from '@cratis/scene.model';
import { componentAnatomy } from '@cratis/scene.react';

/**
 * What each `@cratis/components` component takes from a design system (R2), keyed by the bare component name. `theme/sceneTokenBridge.css`
 * maps the anatomy onto the library's `--cratis-*` layer: the Page's canvas, the Card and Popover surfaces, the Menu's hover and selected
 * states and the primary Button's color and focus ring.
 */
export const cratisComponentsAnatomy: Readonly<Record<string, ComponentAnatomy>> = {
    page: componentAnatomy(['background', 'text', 'font'], ['default']),
};
