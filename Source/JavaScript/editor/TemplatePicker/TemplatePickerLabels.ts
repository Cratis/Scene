// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Every label the template picker shows. The host owns the resource file; declaring the shape here makes a missing label a compile error there. */
export interface TemplatePickerLabels {
    /** The filter field's placeholder and accessible name. */
    filter: string;

    /** The heading over the user's own templates. */
    myTemplates: string;

    /** The row that opens the blueprints, and the heading of the panel it opens. */
    blueprints: string;

    /** The category heading for templates that name none, shown only beside named ones. */
    uncategorized: string;

    /** The footer action that makes a template from what is there now. */
    newFromCurrent: string;

    /** The footer action that gives up the choice. */
    clear: string;

    /** The secondary action on a blueprint template that copies it into the user's own. */
    copyToMine: string;

    /** The secondary action on a template that opens it to look at before it is chosen. */
    preview: string;

    /** Shown when nothing applies at the target, or nothing matches the filter. */
    nothingApplies: string;

    /** The footer row that opens the template browser. */
    browseAll: string;

    /** What the control shows when no template is chosen. */
    noTemplate: string;

    /** The accessible name of the menu. */
    menu: string;

    /** The text beside a pinned blueprint template when its blueprint has since been updated; `{version}` is the installed version. */
    updateAvailable: string;
}
