// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate, ScreenTemplate } from '@cratis/scene.model';
import { TemplateReference } from './TemplateReference';

/** A template that can be chosen. */
export interface TemplateCandidate {
    /** What gets stored when it is chosen. */
    reference: TemplateReference;

    /** The name to show. */
    displayName: string;

    /** What the template is for, when its package says. */
    description?: string;

    /** The package that provides the template, or empty for one built for the application. */
    source: string;

    /** The Scene screen template. Application templates and dialog templates have none: they carry no slot contract. */
    template?: ScreenTemplate;

    /** The Scene dialog template, when the candidate is one - what a State Change slice is presented in. */
    dialogTemplate?: DialogTemplate;
}
