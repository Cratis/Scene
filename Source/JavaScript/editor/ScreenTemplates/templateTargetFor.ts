// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope } from '@cratis/scene.model';
import type { TemplateTarget } from '@cratis/scene.engine';
import { TemplateCatalog } from './TemplateCatalog';
import { TemplateLevel } from './TemplateLevel';
import { TemplateReference } from './TemplateReference';
import { TemplateReferenceKind } from './TemplateReferenceKind';
import { TemplateSelection } from './TemplateSelection';

/** The Scene scope a hierarchy level chooses at. */
export function templateScopeOf(level: TemplateLevel): TemplateScope {
    switch (level) {
        // The application's default is what its modules start from, so it is chosen from what a module may use. The
        // shell itself (a layout, Scene's Application scope) is chosen on the UI Profile page.
        case TemplateLevel.Application:
        case TemplateLevel.Module: return TemplateScope.Module;
        case TemplateLevel.Feature: return TemplateScope.Feature;
        case TemplateLevel.SubFeature: return TemplateScope.Subfeature;
        case TemplateLevel.Slice: return TemplateScope.Slice;
    }
}

/**
 * What Scene needs to know about a level to say which templates apply there: the scope, the slice's kind, the
 * template (or layout) a choice has to go inside, and the templates already chosen above.
 *
 * @param selection The level.
 * @param catalog The templates that exist.
 * @returns The Scene {@link TemplateTarget}.
 */
export function templateTargetFor(selection: Pick<TemplateSelection, 'level' | 'sliceKind' | 'blueprintAbove' | 'chain' | 'reference'>, catalog: Pick<TemplateCatalog, 'layout'>): TemplateTarget {
    const container = selection.blueprintAbove?.template ?? catalog.layout;
    return {
        scope: templateScopeOf(selection.level),
        sliceKind: selection.level === TemplateLevel.Slice ? selection.sliceKind : undefined,
        container: container ? { name: container.name, slots: container.slots } : undefined,
        chain: selection.chain.filter(reference => reference.kind === TemplateReferenceKind.Blueprint && !isSame(reference, selection.reference)).map(reference => reference.id),
    };
}

function isSame(left: TemplateReference, right: TemplateReference | undefined): boolean {
    return right !== undefined && left.kind === right.kind && left.id.toLowerCase() === right.id.toLowerCase();
}
