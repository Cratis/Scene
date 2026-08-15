// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement, ContentControl, ItemsControl, ExternalComponent, Panel } from '@cratis/scene.model';

/**
 * Type guards distinguishing the concrete element kinds Scene.Model ships, by the property each kind
 * alone declares. A tree produced by Stage or Studio only ever carries these concrete shapes - `Element`,
 * `VisualElement`, `FrameworkElement` and `Control` are never instantiated directly.
 */

export function isContentControl(element: SceneElement): element is ContentControl {
    return 'content' in element;
}

export function isItemsControl(element: SceneElement): element is ItemsControl {
    return 'itemsSource' in element && 'itemTemplate' in element;
}

export function isExternalComponent(element: SceneElement): element is ExternalComponent {
    return 'componentName' in element;
}

export function isPanel(element: SceneElement): element is Panel {
    return 'children' in element;
}
