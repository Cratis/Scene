// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Layout } from '@cratis/scene.model';
import type { TemplateSource } from '@cratis/scene.engine';
import { TemplateCandidate } from './TemplateCandidate';

/** Every template that exists for an application, and the layout the profile's shell provides. */
export interface TemplateCatalog {
    /** The layout of the profile's shell, which the outermost template is placed in. */
    layout?: Layout;

    /** The screen templates the packages of the UI Profile provide. */
    blueprint: TemplateCandidate[];

    /** The dialog templates the packages of the UI Profile provide. */
    dialog: TemplateCandidate[];

    /** The templates built for the application. */
    application: TemplateCandidate[];

    /**
     * What Scene's `applicableTemplates` reads: the packages in override order, each with only the templates that
     * win (a later package's template replaces an earlier one of the same name), and the application's own templates.
     * Applicability is Scene's to decide - nothing in Studio filters templates itself (spec TPL5).
     */
    library: { own: TemplateSource; blueprints: TemplateSource[] };
}
