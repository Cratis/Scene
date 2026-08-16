// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarSeparator } from '@cratis/components/Toolbar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { unionProperty } from '../properties';

/** Whether the separator is drawn as a horizontal rule or a vertical one. */
const orientations = ['vertical', 'horizontal'] as const;

/**
 * The `Cratis.Components:toolbarSeparator` component - `ToolbarSeparator` from
 * `@cratis/components/Toolbar`.
 *
 * The divider between groups of tools. Its `orientation` describes the *toolbar* it sits in rather than
 * the line it draws - a vertical toolbar gets a horizontal rule - which matches how the toolbar's own
 * `orientation` reads, so a screen sets the same value on both.
 */
export function SceneToolbarSeparator({ element }: RegisteredComponentProps) {
    return <ToolbarSeparator orientation={unionProperty(element.properties, 'orientation', orientations)} />;
}
