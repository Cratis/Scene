// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarEmphasis } from '@cratis/scene.model';
import { SliceDialog } from './SliceDialog';

/**
 * A toolbar button resolved against the application structure: what a renderer needs to draw it and to open its dialog.
 */
export interface ResolvedToolbarButton {
    /** The button identity. */
    id: string;

    /** The text shown on the button. */
    title: string;

    /** How prominent the button is. */
    emphasis: ToolbarEmphasis;

    /** Qualified icon reference, when the button has one. */
    icon?: string;

    /** The qualified id of the slice the button invokes, when it names or resolves to one. */
    slice?: string;

    /** Whether the slice was found from a hand-authored command rather than named directly. */
    converted: boolean;

    /** The command the slice accepts; absent unless the slice is a known state change. */
    command?: string;

    /** The task dialog the button opens; absent unless the slice is a known state change. */
    dialog?: SliceDialog;
}
