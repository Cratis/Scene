// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicableTemplate } from '@cratis/scene.engine';

/** What choosing in the template picker does. */
export interface TemplatePickerHandlers {
    /** A template was chosen: the reference to store. */
    onChoose: (template: ApplicableTemplate) => void;

    /** The user asked to copy a blueprint template into their own (spec TPL3). Absent when copying is not offered. */
    onCopyToMine?: (template: ApplicableTemplate) => void;

    /** The user asked to look at a template before choosing it. Absent when the host cannot show one. */
    onPreview?: (template: ApplicableTemplate) => void;

    /** The user asked to browse every template in the template browser, where a blueprint can also be added to the UI profile. Absent when the host has no browser. */
    onBrowseAll?: () => void;

    /** The user asked for a new template made from what is there now. Absent when that is not offered. */
    onNewFromCurrent?: () => void;

    /** The user gave up the choice, so the level inherits again (or has no template). Absent when there is nothing to give up. */
    onClear?: () => void;
}
