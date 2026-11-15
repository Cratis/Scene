// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SliceKind } from '@cratis/scene.model';
import { TemplateCandidate } from './TemplateCandidate';
import { TemplateDiagnostic } from './TemplateDiagnostic';
import { TemplateInheritance } from './TemplateInheritance';
import { TemplateLevel } from './TemplateLevel';
import { TemplateReference } from './TemplateReference';

/** The template in effect at one level, and how it got there. */
export interface TemplateSelection {
    /** The node, or `application` for the application's default. */
    nodeId: string;

    /** The level. */
    level: TemplateLevel;

    /** For a slice, what kind of slice it is - which decides whether it is presented in a dialog, a form or a screen. */
    sliceKind?: SliceKind;

    /** Whether this level chose its template, as opposed to inheriting it. */
    isExplicit: boolean;

    /** The template in effect: the explicit one, else the nearest ancestor's. `undefined` when nothing is chosen above. */
    reference?: TemplateReference;

    /** The template in effect, when something still provides it. */
    candidate?: TemplateCandidate;

    /** For an inherited template, the level that chose it. */
    inheritedFrom?: TemplateInheritance;

    /** Problems with the template this level chose. Empty for an inheriting level. */
    diagnostics: TemplateDiagnostic[];

    /** The templates chosen from the application down to this level, outermost first, repeats removed. */
    chain: TemplateReference[];

    /** The nearest blueprint template above this level, which a choice here has to fit inside. */
    blueprintAbove?: TemplateCandidate;
}
