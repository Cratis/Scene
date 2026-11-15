// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HorizontalAlignment, Visibility, VerticalAlignment } from '@cratis/scene.model';

// The fields every Scene element carries, with the values a freshly authored element starts with.
export function frameworkElement(id: string, name: string) {
    return {
        id,
        name,
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
        properties: {} as Record<string, unknown>,
    };
}
