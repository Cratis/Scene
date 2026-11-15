// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { TemplateBrowserEntry } from './TemplateBrowserEntry';

/**
 * What the browser can ask its host to do. Every action is optional: the browser offers an action only when the host handles it, so a dialog opened from
 * a picker offers choosing and the page offers managing, from the same component.
 */
export interface TemplateBrowserActions {
    /** Chooses the template (dialog). Not offered for a template that does not fit, is incompatible, or whose blueprint is not in the profile. */
    onChoose?: (entry: TemplateBrowserEntry) => void;

    /** Makes a new template of the application's own. */
    onNew?: () => void;

    /** Opens an own template in the template editor. */
    onEdit?: (entry: TemplateBrowserEntry) => void;

    /** Renames an own template. */
    onRename?: (entry: TemplateBrowserEntry) => void;

    /** Makes a copy of an own template. */
    onDuplicate?: (entry: TemplateBrowserEntry) => void;

    /** Deletes an own template. */
    onRemove?: (entry: TemplateBrowserEntry) => void;

    /** Copies a blueprint's template into the application's own. */
    onCopyToMine?: (entry: TemplateBrowserEntry) => void;

    /** Adds a blueprint to the application's UI profile, so its templates can be chosen. */
    onAddBlueprint?: (blueprint: string) => void;

    /** Imports templates from a file. */
    onImport?: () => void;

    /** Exports an own template to a file. */
    onExport?: (entry: TemplateBrowserEntry) => void;
}
