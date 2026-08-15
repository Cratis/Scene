// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContentControl, ItemsControl, ExternalComponent, Panel } from '@cratis/scene.model';

/**
 * The contract a renderer implements to turn a resolved Scene element tree into `TOutput` - real
 * React/DOM output for `Scene.React`, and whatever a future `Scene.Native` or `Scene.Desktop` renderer's
 * own platform needs. One method per concrete element kind Scene.Model ships; an adapter package's own
 * component types render through {@link renderExternalComponent} rather than needing their own method
 * here, so this contract does not grow as vendor/internal widget libraries are added.
 */
export interface Renderer<TOutput> {
    /**
     * Renders a {@link ContentControl}, given its already-rendered content.
     */
    renderContentControl(element: ContentControl, content: TOutput): TOutput;

    /**
     * Renders an {@link ItemsControl}, given its already-rendered items.
     */
    renderItemsControl(element: ItemsControl, items: TOutput[]): TOutput;

    /**
     * Renders an {@link ExternalComponent}, given its already-rendered named slots.
     */
    renderExternalComponent(element: ExternalComponent, slots: Record<string, TOutput[]>): TOutput;

    /**
     * Renders a {@link Panel}, given its already-rendered children.
     */
    renderPanel(element: Panel, children: TOutput[]): TOutput;
}
