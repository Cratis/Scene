// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applicableTemplates, type ApplicableTemplateSet } from '@cratis/scene.engine';
import { TemplateCatalog } from './TemplateCatalog';
import { TemplateReference } from './TemplateReference';
import { TemplateReferenceKind } from './TemplateReferenceKind';
import { TemplateSelection } from './TemplateSelection';
import { templateTargetFor } from './templateTargetFor';

/**
 * The templates that may be chosen at a level - own templates by category, then each blueprint that has at least
 * one applicable template. This is Scene's `applicableTemplates`, unmodified: Studio adds no applicability rule
 * of its own (spec TPL5), so what the picker offers is what Stage and the CLI would accept.
 *
 * @param selection The level.
 * @param catalog The templates that exist.
 * @returns The applicable templates.
 */
export function applicableTemplatesAt(selection: Pick<TemplateSelection, 'level' | 'sliceKind' | 'blueprintAbove' | 'chain' | 'reference'>, catalog: TemplateCatalog): ApplicableTemplateSet {
    return applicableTemplates(catalog.library, templateTargetFor(selection, catalog));
}

/**
 * Whether a reference is among the applicable templates.
 *
 * @param set What applies.
 * @param reference The reference to look for.
 * @returns Whether it applies.
 */
export function isTemplateApplicable(set: ApplicableTemplateSet, reference: TemplateReference): boolean {
    const id = reference.id.toLowerCase();
    const pool = reference.kind === TemplateReferenceKind.Application
        ? set.own.flatMap(group => group.templates)
        : set.blueprints.flatMap(blueprint => blueprint.categories.flatMap(group => group.templates));
    return pool.some(template => template.reference.id.toLowerCase() === id);
}
