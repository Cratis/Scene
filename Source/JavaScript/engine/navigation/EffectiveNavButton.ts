// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarEmphasis } from '@cratis/scene.model';
import { NavigationItemOrigin } from './NavigationItemOrigin';

/**
 * One application-level toolbar button a region effectively shows, with its provenance.
 */
export interface EffectiveNavButton {
    /** The button identity. */
    id: string;

    /** The text shown on the button. */
    title: string;

    /** How prominent the button is; `secondary` when the button names none. */
    emphasis: ToolbarEmphasis;

    /** Qualified icon reference, when the button has one. */
    icon?: string;

    /** The qualified id of the state change slice the button opens, when it names one. */
    slice?: string;

    /** The policy the user must satisfy to see the button, when it names one. */
    authorize?: string;

    /** Which level defined the button. */
    origin: NavigationItemOrigin;

    /** Whether the button may not be edited here: it is inherited from the application into a module. */
    readOnly: boolean;

    /** A sentence saying why the button is shown and whether it can be edited here. */
    reason: string;
}
