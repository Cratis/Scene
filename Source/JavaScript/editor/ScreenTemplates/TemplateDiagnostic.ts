// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateDiagnosticKind } from './TemplateDiagnosticKind';
import { TemplateReference } from './TemplateReference';

/** A problem with the template chosen at a level. The choice is kept; the problem is reported. */
export interface TemplateDiagnostic {
    /** What is wrong. */
    kind: TemplateDiagnosticKind;

    /** The template the level refers to. */
    reference: TemplateReference;

    /** For an incompatible template, the template (or layout) it was meant to go inside. */
    container?: string;
}
