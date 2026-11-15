// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { frameworkElement } from './frameworkElement';

// Creates a Scene component element - a button, a table, a navigation bar - from its bare or package-qualified name.
export function createExternalComponent(
    id: string,
    name: string,
    componentName: string,
    properties: Record<string, unknown> = {},
    slots: Record<string, SceneElement[]> = {}
): ExternalComponent {
    return { ...frameworkElement(id, name), componentName, properties, slots } as unknown as ExternalComponent;
}
