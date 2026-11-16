// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PreviewStrings } from '../Preview/PreviewStrings';

/**
 * Every label the blueprint gallery shows. The host owns the resource file; declaring the shape here makes a missing label a compile error there.
 * Messages that name things use `{name}`, `{count}`, `{from}` and `{to}`.
 */
export interface BlueprintGalleryStrings {
    /** The gallery's title, and the accessible name of its dialog. */
    title: string;

    /** One line under the title saying what the gallery is. */
    intro: string;

    /** The filter field's placeholder and accessible name. */
    filter: string;

    /** The accessible name of the list of blueprints. */
    list: string;

    /** Shown when nothing matches the filter. */
    nothingMatches: string;

    /** Shown when no blueprint is loaded at all. */
    noBlueprints: string;

    /** The accessible name of a thumbnail: `{name}` is the blueprint. */
    thumbnailAlt: string;

    /** What the thumbnail shows while it loads or when the blueprint has none. */
    noThumbnail: string;

    /** The version tag: `{version}`. */
    version: string;

    /** The heading over what the blueprint gives. */
    whatYouGet: string;

    /** The count of screens: `{count}`. */
    screens: string;

    /** The count of templates: `{count}`. */
    templates: string;

    /** The heading over the sample data packs. */
    sampleData: string;

    /** The marker on a blueprint's default sample data pack. */
    defaultPack: string;

    /** The requirements line: `{names}`. */
    requires: string;

    /** The states a blueprint can be in. */
    state: { available: string; templatePack: string; shell: string; required: string };

    /** The heading over the templates a blueprint has no category for. */
    uncategorized: string;

    /** The actions on a card. The `...Named` labels are the accessible names - they say which blueprint the button acts on; `{name}` is the blueprint. */
    actions: {
        add: string;
        addNamed: string;
        remove: string;
        removeNamed: string;
        preview: string;
        previewNamed: string;
        details: string;
        hideDetails: string;
        close: string;
        done: string;
        shellCannotBeRemoved: string;
        requiredCannotBeRemoved: string;
    };

    /** What is said when a reference to the blueprint has another version on offer: `{from}` is the version it was chosen from, `{to}` the version on offer, `{pin}` the range it accepts. */
    update: { available: string; blocked: string; notSatisfied: string; invalid: string };

    /** The preview of a blueprint: the title (`{name}`) and what is said while it is being made. */
    preview: { title: string; back: string; loading: string; strip: PreviewStrings };
}
