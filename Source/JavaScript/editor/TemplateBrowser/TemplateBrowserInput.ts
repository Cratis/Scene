// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { TemplateSource, TemplateTarget } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { BlueprintReferenceUse } from '../BlueprintGallery/BlueprintReferenceUse';
import type { TemplateReference } from '../ScreenTemplates/TemplateReference';
import type { UiProfileSettings } from '../UiProfile/UiProfileSettings';
import type { TemplateBrowserMode } from './TemplateBrowserMode';

/** Everything the browser's model is made of. */
export interface TemplateBrowserInput {
    /** Where the browser is hosted. */
    mode: TemplateBrowserMode;

    /** The application's own templates, as Scene reads them. */
    own: TemplateSource;

    /** Every blueprint the build ships that provides templates - in the profile or not - in override order. */
    blueprints: TemplateSource[];

    /** The bundles the blueprints come from, for what the blueprint catalog says about them: description, thumbnail, version. */
    bundles: readonly ScenePackageBundle[];

    /** The draft UI profile, which says which blueprints are in the application. */
    profile: UiProfileSettings;

    /** The packages the resolved profile uses. A blueprint's template can be chosen only when its package is among them. */
    active: ReadonlySet<string>;

    /** The packages the profile has only because another requires them. */
    requiredBy?: ReadonlySet<string>;

    /** The application's template references that pin a blueprint, for "update available". */
    references?: readonly BlueprintReferenceUse[];

    /** The level (and what is above it) the browser was opened for. Absent on the page: every template is listed. */
    target?: TemplateTarget;

    /** The template in effect at the target. */
    current?: TemplateReference;

    /** The rail row selected. */
    railId: string;

    /** The category to narrow by, or empty. */
    category: string;

    /** What was typed into the filter. */
    filter: string;
}
