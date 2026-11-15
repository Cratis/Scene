// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateCandidate } from './TemplateCandidate';
import { TemplateCatalog } from './TemplateCatalog';
import { TemplateReference } from './TemplateReference';
import { TemplateReferenceKind } from './TemplateReferenceKind';

/**
 * Finds the template a reference names.
 *
 * A blueprint reference names either a screen template or a dialog template; the screen template wins when both exist.
 *
 * @param catalog The templates that exist.
 * @param reference The reference to look up.
 * @returns The candidate, or `undefined` when nothing provides it any more.
 */
export function findTemplateCandidate(catalog: TemplateCatalog, reference: TemplateReference): TemplateCandidate | undefined {
    const id = reference.id.toLowerCase();
    const named = (pool: TemplateCandidate[]) => pool.find(candidate => candidate.reference.id.toLowerCase() === id);
    return reference.kind === TemplateReferenceKind.Blueprint ? named(catalog.blueprint) ?? named(catalog.dialog) : named(catalog.application);
}
