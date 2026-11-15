// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BlueprintGalleryStrings } from '../BlueprintGallery/BlueprintGalleryStrings';
import type { TemplateCatalogKind } from '@cratis/scene.engine';
import type { TemplateBrowserEmpty } from './TemplateBrowserEmpty';

/**
 * Every label the template browser shows. The host owns the resource file; declaring the shape here makes a missing label a compile error there.
 * Messages that name things use `{name}`, `{count}`, `{from}`, `{to}`, `{version}` and `{target}`.
 */
export interface TemplateBrowserStrings {
    /** The title of the page and of the dialog, and the accessible name of both. */
    title: string;

    /** One line under the title on the page. */
    intro: string;

    /** The filter field's placeholder and accessible name. */
    filter: string;

    /** The category filter's accessible name and its "any category" option. */
    category: string;
    anyCategory: string;

    /** The accessible names of the rail, the grid and the pane. */
    rail: string;
    grid: string;
    pane: string;

    /** The rail's rows that are not blueprints, and the headings over the rest. */
    allTemplates: string;
    myTemplates: string;
    blueprints: string;
    needsBlueprint: string;

    /** The count beside a rail row: `{count}`. */
    count: string;

    /** What a kind of template is called. */
    kinds: Record<TemplateCatalogKind, string>;

    /** The badges on a card. */
    badges: { own: string; blueprint: string; current: string; notInProfile: string; incompatible: string; doesNotApply: string };

    /** What the thumbnail shows when there is none. */
    noThumbnail: string;

    /** What the grid says when it has nothing to list, by reason. */
    empty: Record<TemplateBrowserEmpty, string>;

    /** Said under the grid on a dialog when templates were left out because they do not fit: `{count}`, `{target}`. */
    hidden: string;

    /** The pane: what it says when nothing is selected, the facts it lists and the headings over them. */
    selectATemplate: string;
    facts: { package: string; category: string; scopes: string; sliceKinds: string; license: string; kind: string };
    doesNotApplyHeading: string;
    problemsHeading: string;
    addBlueprintFirst: string;

    /** The preview: what is shown while it loads and when there is nothing to draw, the controls, and the one that opens the whole blueprint. */
    preview: {
        none: string;
        previewOf: string;
        screens: string;
        failed: string;
        state: string;
        size: string;
        states: Record<string, string>;
        sizes: Record<string, string>;
        wholeBlueprint: string;
        back: string;
    };

    /** The update a blueprint has on offer, as the gallery says it. */
    update: BlueprintGalleryStrings['update'];

    /** The blueprint preview's labels, which the whole-blueprint preview uses as the gallery does. */
    blueprintPreview: BlueprintGalleryStrings['preview'];

    /** The actions. The `...Named` labels are the accessible names - they say which template the button acts on; `{name}` is the template. */
    actions: {
        choose: string;
        chooseNamed: string;
        browse: string;
        close: string;
        newTemplate: string;
        edit: string;
        editNamed: string;
        rename: string;
        renameNamed: string;
        duplicate: string;
        duplicateNamed: string;
        remove: string;
        removeNamed: string;
        copyToMine: string;
        copyToMineNamed: string;
        addBlueprint: string;
        addBlueprintNamed: string;
        import: string;
        export: string;
        exportNamed: string;
    };
}
