// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletAction, OutletButton, OutletGroup, OutletItem, OutletItemKind, OutletMode, OutletRefinement, Toolbar, ToolbarButton } from '@cratis/scene.model';

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
 * The actions of an outlet's items - its buttons and menu entries, and those inside its groups - in order.
 * @param items The items.
 * @returns The actions.
 */
export function outletActionsOf(items: readonly OutletItem[]): OutletAction[] {
    return items.flatMap(item => {
        if (item.kind === OutletItemKind.Group) return outletActionsOf((item as OutletGroup).items);
        return item.kind === OutletItemKind.Button || item.kind === OutletItemKind.MenuEntry ? [item as OutletAction] : [];
    });
}

/**
 * Turns an action of an outlet into the toolbar button the toolbar rules validate (`validateToolbarButtons`): its slice, or
 * the command a hand-authored action names as the button's `target`.
 * @param action The action.
 * @returns The button, or undefined when the action navigates or runs a built-in instead of a slice.
 */
export function outletActionAsToolbarButton(action: OutletAction): ToolbarButton | undefined {
    if (action.navigateTo !== undefined || action.runs !== undefined) return undefined;
    const button: ToolbarButton = { id: action.id, title: action.title };
    if (action.slice !== undefined) button.slice = action.slice;
    if (action.command !== undefined) button.target = action.command;
    if (action.icon !== undefined) button.icon = action.icon;
    const emphasis = (action as OutletButton).emphasis;
    if (emphasis !== undefined) button.emphasis = emphasis;
    return button;
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
