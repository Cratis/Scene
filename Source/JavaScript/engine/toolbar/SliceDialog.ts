// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceDialogSource } from './SliceDialogSource';

/**
 * The task dialog a state change slice opens: its command and the dialog template that shows the command's fields as a form.
 */
export interface SliceDialog {
    /** The qualified id of the slice. */
    slice: string;

    /** The command the dialog submits. */
    command: string;

    /** The dialog template. */
    template: string;

    /** Whether the slice named the template or the default was used. */
    source: SliceDialogSource;
}
