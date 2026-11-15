// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { nestScreenTemplates } from '@cratis/scene.blueprint.default';
import { TemplateCatalog } from './TemplateCatalog';
import { TemplateReferenceKind } from './TemplateReferenceKind';
import { TemplateSelection } from './TemplateSelection';
import { findTemplateCandidate } from './findTemplateCandidate';

/**
 * Folds the chain of templates in effect at a level into the one template the screen is composed from.
 *
 * This is Scene's `nestScreenTemplates`, called unmodified on the blueprint templates of the chain - the same
 * function Play uses, so the editor shows exactly what runs. The application's own templates are not part of
 * the fold: they carry no slots to nest into. A chain whose templates can no longer be found folds what is left.
 *
 * @param selection The level to compose.
 * @param catalog The templates that exist.
 * @returns The folded template, or `undefined` when no blueprint template is in effect.
 */
export function composeTemplateChain(selection: TemplateSelection, catalog: TemplateCatalog): ScreenTemplate | undefined {
    const templates = selection.chain
        .filter(reference => reference.kind === TemplateReferenceKind.Blueprint)
        .flatMap(reference => findTemplateCandidate(catalog, reference)?.template ?? []);
    return templates.length === 0 ? undefined : nestScreenTemplates(templates);
}
