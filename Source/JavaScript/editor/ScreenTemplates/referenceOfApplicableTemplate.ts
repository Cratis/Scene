// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicableTemplate } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { TemplateReference } from './TemplateReference';
import { TemplateReferenceKind } from './TemplateReferenceKind';

/**
 * The reference to store for a template the picker offered: an own template is stored by identifier, a blueprint
 * template by name - the one string every level has always stored.
 *
 * @param template The template Scene said applies.
 * @returns The reference.
 */
export function referenceOfApplicableTemplate(template: Pick<ApplicableTemplate, 'reference'>): TemplateReference {
    return {
        kind: template.reference.source === TemplateReferenceSource.Own ? TemplateReferenceKind.Application : TemplateReferenceKind.Blueprint,
        id: template.reference.id,
    };
}
