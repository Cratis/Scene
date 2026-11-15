// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SliceKind, TemplateScope } from '@cratis/scene.model';
import type { TemplateCatalogKind } from '@cratis/scene.engine';
import type { BlueprintUpdate } from '../BlueprintGallery/BlueprintUpdate';
import type { TemplateReference } from '../ScreenTemplates/TemplateReference';
import type { TemplateBrowserApplicability } from './TemplateBrowserApplicability';
import type { TemplateOrigin } from './TemplateOrigin';

/** One template as the browser shows it: a card in the grid and, when selected, the pane beside it. */
export interface TemplateBrowserEntry {
    /** Unique within the browser: the origin, the package and the template's name. */
    id: string;

    /** Whose the template is. */
    origin: TemplateOrigin;

    /** What is stored when the template is chosen. */
    reference: TemplateReference;

    /** What kind of template it is: a screen template, a dialog template or a layout (shell). */
    kind: TemplateCatalogKind;

    /** The template's name in Scene: the identifier for an own template. */
    name: string;

    /** The name to show. */
    displayName: string;

    /** What the template is for, when its package says. */
    description?: string;

    /** The category it is listed under. */
    category?: string;

    /** The package that provides it; absent for an own template. */
    package?: string;

    /** The name of that package to show. */
    packageName?: string;

    /** The version of that package. */
    packageVersion?: string;

    /** The levels the template may be chosen at, when it says. */
    scopes: TemplateScope[];

    /** The kinds of slice it fits, when it says. */
    sliceKinds: SliceKind[];

    /** The thumbnail's path inside its package. */
    thumbnail?: string;

    /** The license short name. */
    license?: string;

    /** Whether Scene says the host can run it, and what is wrong when it cannot. */
    compatible: boolean;
    problems: string[];

    /** Whether its package is in the application's UI profile. An own template always is; a blueprint template of a package that is not has to be added first. */
    installed: boolean;

    /** Whether it is the template in effect at the target. */
    current: boolean;

    /** Whether it fits the target. */
    applicability: TemplateBrowserApplicability;

    /** The worst thing the application's pinned references to its package have to say. */
    update?: BlueprintUpdate;
}
