// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind, DestinationKind, DestinationReference } from '@cratis/scene.model';
import { ResolvedToolbarButton } from '@cratis/scene.engine';

const literal = (value: string): BindingExpression => ({ kind: BindingSourceKind.Literal, path: '', value }) as BindingExpression;

/** The dialog parameters a slice dialog is opened with; the navigation host hands them back as `currentDialogParameters`. */
export interface SliceDialogParameters {
    slice: string;
    command: string;
    title: string;

    /** Whether the slice's screen opens as a dialog or as a drawer; a dialog when absent. */
    presentation?: SliceDialogPresentation;
}

/** How a slice's screen sits over the page: centered as a dialog, or docked to the side as a drawer. Neither is routed. */
export type SliceDialogPresentation = 'dialog' | 'drawer';

/**
 * The destination that opens a slice's screen over the page, as a dialog or a drawer, through the navigation host.
 * @param dialog The dialog template, slice and command (`sliceDialogFor`).
 * @param dialog.template The dialog template.
 * @param dialog.slice The qualified id of the slice.
 * @param dialog.command The command the slice submits.
 * @param title The title of the dialog.
 * @param presentation Whether it opens as a dialog or a drawer.
 * @returns The destination.
 */
export function sliceScreenDestination(dialog: { template: string; slice: string; command: string }, title: string, presentation: SliceDialogPresentation = 'dialog'): DestinationReference {
    const routeParameterBindings: Record<string, BindingExpression> = {
        slice: literal(dialog.slice),
        command: literal(dialog.command),
        title: literal(title),
    };
    if (presentation === 'drawer') routeParameterBindings.presentation = literal(presentation);
    return { kind: DestinationKind.Dialog, dialog: dialog.template, routeParameterBindings };
}

/**
 * The destination that opens a toolbar button's task dialog through the navigation host: the dialog template the slice
 * resolves to (`sliceDialogFor`), with the slice, its command and the button's title as parameters.
 * @param button The resolved button.
 * @returns The destination, or undefined when the button has no state change slice to open.
 */
export function sliceDialogDestination(button: ResolvedToolbarButton): DestinationReference | undefined {
    if (!button.dialog) return undefined;
    return {
        kind: DestinationKind.Dialog,
        dialog: button.dialog.template,
        routeParameterBindings: {
            slice: literal(button.dialog.slice),
            command: literal(button.dialog.command),
            title: literal(button.title),
        },
    };
}

/** Reads the slice dialog parameters back from what the host carries; undefined when they are not those of a slice dialog. */
export function sliceDialogParameters(parameters: Record<string, string> | undefined): SliceDialogParameters | undefined {
    const slice = parameters?.slice;
    const command = parameters?.command;
    if (!slice || !command) return undefined;
    const opened: SliceDialogParameters = { slice, command, title: parameters?.title || command };
    if (parameters?.presentation === 'drawer') opened.presentation = 'drawer';
    return opened;
}
