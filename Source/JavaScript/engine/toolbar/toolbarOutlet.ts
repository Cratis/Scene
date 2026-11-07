// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletButton, OutletItemKind, OutletMode, OutletRefinement, Toolbar, ToolbarButton } from '@cratis/scene.model';

/** The name of the outlet of actions a screen template's toolbar is. */
export const toolbarOutletName = 'toolbar';

/**
 * Turns a toolbar button into the button of the outlet of actions the toolbar is. A hand-authored button's `target`
 * (a command name) becomes the outlet button's `command`.
 * @param button The toolbar button.
 * @returns The outlet button.
 */
export function toolbarButtonAsOutletButton(button: ToolbarButton): OutletButton {
    const result: OutletButton = { kind: OutletItemKind.Button, id: button.id, title: button.title };
    if (button.icon !== undefined) result.icon = button.icon;
    if (button.slice !== undefined) result.slice = button.slice;
    if (button.target !== undefined) result.command = button.target;
    if (button.emphasis !== undefined) result.emphasis = button.emphasis;
    return result;
}

/**
 * Turns the toolbar of a feature or module - whose buttons were added to every screen's toolbar - into what it is now:
 * a refinement that extends the `toolbar` outlet with those buttons.
 * @param toolbar The feature or module toolbar.
 * @param outlet The outlet it extends; `toolbar` when absent.
 * @returns The refinement.
 */
export function toolbarAsOutletRefinement(toolbar: Toolbar, outlet: string = toolbarOutletName): OutletRefinement {
    return { outlet, mode: OutletMode.Extends, items: toolbar.buttons.map(toolbarButtonAsOutletButton) };
}
