// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';

/**
 * Builds the {@link ExternalComponent} a renderer would hand an adapter, with every inherited layout
 * property at its neutral value.
 *
 * An adapter only ever reads `componentName`, `properties` and `slots`, but the element it receives is a
 * fully-formed `FrameworkElement`. Constructing one by hand in every spec would bury the two or three
 * properties a scenario is actually about under twenty that are never read - so the noise lives here,
 * once, and a spec says only what makes it different.
 */
export function externalComponent(componentName: string, properties: Record<string, unknown> = {}): ExternalComponent {
    return {
        id: componentName,
        name: componentName,
        componentName,
        properties,
        slots: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
    };
}
