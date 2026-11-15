// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate, SliceKind, TemplateRole, TemplateScope } from '@cratis/scene.model';

/** A screen template built for the application, as the catalog needs to know it. */
export interface ApplicationTemplate {
    /** The template's identifier. */
    id: string;

    /** The template's name. */
    name: string;

    /** The category the template is listed under (spec TPL1). Absent for a template made before categories existed. */
    category?: string;

    /** The levels the template may be chosen at. Absent for a template made before scopes existed: it fits every level a screen sits at. */
    scopes?: TemplateScope[];

    /** For a template made for slices, the kinds of slice it fits. Absent for one made before this was recorded: it fits every slice that has a screen. */
    sliceKinds?: SliceKind[];

    /** `Root` when the template is made to be the application's shell, which its document says. */
    role?: TemplateRole;

    /** The slot of a shell that holds the screen when a screen does not say which one it fills. */
    primarySlot?: string;

    /** The slots a shell offers. */
    slots?: string[];

    /**
     * The template as its saved Scene document declares it - the content it places and the arrangement it lays out - when the document is known. A shell that is
     * drawn needs it: the metadata above says where a template may be used, only the template itself says what it draws.
     */
    template?: ScreenTemplate;
}
