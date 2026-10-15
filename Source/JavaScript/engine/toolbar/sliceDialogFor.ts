// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '../structure';
import { SliceDialog } from './SliceDialog';
import { SliceDialogSource } from './SliceDialogSource';

/** The dialog template used when a slice names none. */
export const defaultSliceDialogTemplate = 'FormDialog';

/**
 * Works out the task dialog a state change slice opens, once, so no host decides it again (TB4): the slice's own
 * dialog template when it names one, else the default form dialog.
 *
 * The C# engine (`SliceDialogs.For`) resolves the same dialog; both are asserted against `toolbar-slice-fixtures.json`.
 *
 * @param index The modules, features and slices of the application.
 * @param sliceId The slice's qualified id.
 * @param defaultTemplate The template used when the slice names none; {@link defaultSliceDialogTemplate} when absent.
 * @returns The dialog, or undefined when there is no such slice or it is not a state change.
 */
export function sliceDialogFor(index: ApplicationStructureIndex, sliceId: string, defaultTemplate?: string): SliceDialog | undefined {
    const slice = index.findSlice(sliceId);
    if (slice?.kind !== SliceKind.StateChange) return undefined;

    const command = slice.command ?? slice.id;
    return slice.dialogTemplate
        ? { slice: sliceId, command, template: slice.dialogTemplate, source: SliceDialogSource.Slice }
        : { slice: sliceId, command, template: defaultTemplate ?? defaultSliceDialogTemplate, source: SliceDialogSource.Default };
}
