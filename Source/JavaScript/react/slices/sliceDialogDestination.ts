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
    return slice && command ? { slice, command, title: parameters?.title || command } : undefined;
}
