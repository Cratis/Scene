// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DockPanel, Grid, Panel, StackPanel, WrapPanel } from '@cratis/scene.model';

/**
 * Type guards telling the concrete panels apart, by the property each one alone declares - the same way
 * {@link isPanel} and its siblings tell the element kinds apart. The model carries no discriminator, so a
 * panel is recognized by its own shape rather than by a tag it was serialized with.
 *
 * A plain {@link Panel} matches none of these. That is a real case rather than an oversight: a panel that
 * says nothing about how it arranges its children is a grouping, and a renderer is free to lay it out in
 * whatever way its platform considers neutral.
 */

export function isGrid(panel: Panel): panel is Grid {
    return 'rows' in panel && 'columns' in panel;
}

export function isDockPanel(panel: Panel): panel is DockPanel {
    return 'lastChildFill' in panel;
}

export function isStackPanel(panel: Panel): panel is StackPanel {
    return 'spacing' in panel && 'orientation' in panel;
}

export function isWrapPanel(panel: Panel): panel is WrapPanel {
    // A wrap panel and a stack panel both orient their line; only the stack panel spaces its children,
    // and only the wrap panel sizes them. Checking for the absence of `spacing` is what separates a wrap
    // panel that happens to size neither of its axes from a stack panel.
    return 'orientation' in panel && !('spacing' in panel);
}
