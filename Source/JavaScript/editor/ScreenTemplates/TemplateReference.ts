// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceKind } from './TemplateReferenceKind';

/** A screen template chosen at some level, without the template itself - what is stored. */
export interface TemplateReference {
    /** Where the template comes from. */
    kind: TemplateReferenceKind;

    /** The blueprint template's name, or the application template's identifier. */
    id: string;
}
