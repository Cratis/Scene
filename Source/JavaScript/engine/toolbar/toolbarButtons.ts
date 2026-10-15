// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarButton, ToolbarEmphasis } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '../structure';
import { ResolvedToolbarButton } from './ResolvedToolbarButton';
import { sliceDialogFor } from './sliceDialogFor';

function text(properties: Record<string, unknown>, name: string): string | undefined {
    const value = properties[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Reads a button from the properties of a `core:toolbarItem` element: `label` (or `name`), `kind`, `slice`,
 * `emphasis`, `icon` and `target`.
 *
 * The C# engine (`ToolbarButtons.FromItem`) reads the same; both are asserted against `toolbar-slice-fixtures.json`.
 *
 * @param id The element id.
 * @param properties The element properties.
 * @returns The button, or undefined when the item does not invoke a command or slice - a navigate or dialog item.
 */
export function toolbarButtonFromItem(id: string, properties: Record<string, unknown>): ToolbarButton | undefined {
    const slice = text(properties, 'slice');
    const action = text(properties, 'kind')?.toLowerCase() === 'action';
    if (slice === undefined && !action) return undefined;

    const button: ToolbarButton = { id, title: text(properties, 'label') ?? text(properties, 'name') ?? id };
    if (slice !== undefined) button.slice = slice;

    const emphasis = text(properties, 'emphasis')?.toLowerCase();
    if (emphasis === ToolbarEmphasis.Primary || emphasis === ToolbarEmphasis.Secondary || emphasis === ToolbarEmphasis.Quiet) button.emphasis = emphasis;

    const icon = text(properties, 'icon');
    if (icon !== undefined) button.icon = icon;

    const target = text(properties, 'target');
    if (target !== undefined) button.target = target;
    return button;
}

/**
 * Converts a hand-authored button to a slice-backed one: a button with no slice whose command is accepted by exactly
 * one state change slice names that slice instead.
 * @param index The modules, features and slices of the application.
 * @param button The button.
 * @returns The button to use, and whether it was converted. A button that cannot be converted is returned as it is.
 */
export function normalizeToolbarButton(index: ApplicationStructureIndex, button: ToolbarButton): { button: ToolbarButton; converted: boolean } {
    if (button.slice || !button.target) return { button, converted: false };

    const matches = index.findSlicesByCommand(button.target);
    if (matches.length !== 1) return { button, converted: false };

    const { target, ...rest } = button;
    void target;
    return { button: { ...rest, slice: matches[0] }, converted: true };
}

/**
 * Resolves a button: its slice, command and task dialog, without any rendering. This is what a renderer, Stage and the
 * Studio preview call.
 *
 * The C# engine (`ToolbarButtons.Resolve`) resolves the same; both are asserted against `toolbar-slice-fixtures.json`.
 *
 * @param index The modules, features and slices of the application.
 * @param button The button.
 * @param defaultDialogTemplate The dialog template used when a slice names none.
 */
export function resolveToolbarButton(index: ApplicationStructureIndex, button: ToolbarButton, defaultDialogTemplate?: string): ResolvedToolbarButton {
    const { button: normalized, converted } = normalizeToolbarButton(index, button);
    const dialog = normalized.slice ? sliceDialogFor(index, normalized.slice, defaultDialogTemplate) : undefined;
    const resolved: ResolvedToolbarButton = { id: normalized.id, title: normalized.title, emphasis: normalized.emphasis ?? ToolbarEmphasis.Secondary, converted };
    if (normalized.icon !== undefined) resolved.icon = normalized.icon;
    if (normalized.slice) resolved.slice = normalized.slice;
    if (dialog) {
        resolved.command = dialog.command;
        resolved.dialog = dialog;
    }

    return resolved;
}
