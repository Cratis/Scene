// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Layout, ScreenTemplate, TemplateMetadata, TemplateReference, TemplateReferenceSource, TemplateScope, SliceKind } from '@cratis/scene.model';
import { resolveScreenTemplates } from '../resolveScreenTemplates';
import { validateDialogTemplateApplicability, validateLayoutApplicability, validateScreenTemplateApplicability } from '../templateApplicability';
import { ApplicableBlueprint, ApplicableTemplate, ApplicableTemplateGroup, ApplicableTemplateSet } from './ApplicableTemplateSet';
import { TemplateCatalogKind } from './TemplateCatalogKind';
import { TemplateLibrary } from './TemplateLibrary';
import { TemplateSource } from './TemplateSource';
import { TemplateTarget } from './TemplateTarget';

const screenScopes = [TemplateScope.Module, TemplateScope.Feature, TemplateScope.Subfeature];
const dialogSliceKinds = [SliceKind.StateChange];
const screenSliceKinds = [SliceKind.StateChange, SliceKind.StateView];

/**
 * Decides which templates a picker offers at a target, so no host re-implements the rules: own templates by
 * category, then each blueprint that has at least one applicable template. A blueprint with none is omitted.
 *
 * It composes the applicability validators (kind and scope, explicit scopes override, category never implies a
 * scope, slot fit against the container) and `resolveScreenTemplates` (a template must find exactly one home and
 * nothing may nest inside itself) with the defaults of each hierarchy level, used when a template declares no scopes:
 *
 * - Application - layouts.
 * - Module, Feature, Subfeature - screen templates, fitting a slot of the container.
 * - Slice, state change - dialog templates.
 * - Slice, state view - screen templates that declare the Slice scope or state view slice kinds.
 *
 * Declared `scopes` and `sliceKinds` always override the defaults. The C# engine (`ApplicableTemplates.Compute`)
 * returns identical results; both are asserted against `template-applicability-fixtures.json`.
 */
export function applicableTemplates(library: TemplateLibrary, target: TemplateTarget): ApplicableTemplateSet {
    const own = library.own ? groupByCategory(applicableIn(library.own, target, false)) : [];
    const blueprints: ApplicableBlueprint[] = [];
    for (const source of library.blueprints) {
        const categories = groupByCategory(applicableIn(source, target, true));
        if (categories.length > 0) {
            blueprints.push({ blueprint: source.manifest.name, version: source.manifest.version, displayName: source.manifest.displayName, categories });
        }
    }
    return { own, blueprints };
}

/** Why a layout does not apply at a target; empty when it does. */
export function validateLayoutForTarget(layout: Layout, target: TemplateTarget): string[] {
    return withDefaults(validateLayoutApplicability(layout, target.scope), layout.name, TemplateCatalogKind.Layout, layout.metadata, target);
}

/** Why a screen template does not apply at a target, including whether its slot nesting resolves; empty when it does. */
export function validateScreenTemplateForTarget(template: ScreenTemplate, target: TemplateTarget): string[] {
    const problems = withDefaults(
        validateScreenTemplateApplicability(template, target.scope, target.container),
        template.name,
        TemplateCatalogKind.ScreenTemplate,
        template.metadata,
        target,
    );
    if (problems.length > 0) return problems;

    if (target.chain?.includes(template.name)) {
        return [`Template '${template.name}' is already chosen above this target; nesting it again would make the chain loop`];
    }

    if (template.fitsSlot !== undefined && target.container) {
        const containerName = target.container.name;
        const resolution = resolveScreenTemplates({ name: containerName, slots: target.container.slots } as Layout, [template]);
        const valid = resolution.unplaced.length === 0 && resolution.cycles.length === 0;
        if (!valid || !resolution.placements.some(placement => placement.template === template.name && placement.container === containerName)) {
            return [`Template '${template.name}' cannot be placed in '${containerName}': its slot nesting does not resolve`];
        }
    }
    return [];
}

/** Why a dialog template does not apply at a target; empty when it does. */
export function validateDialogTemplateForTarget(template: DialogTemplate, target: TemplateTarget): string[] {
    return withDefaults(validateDialogTemplateApplicability(template, target.scope), template.name, TemplateCatalogKind.DialogTemplate, template.metadata, target);
}

function applicableIn(source: TemplateSource, target: TemplateTarget, isBlueprint: boolean): ApplicableTemplate[] {
    const { manifest } = source;
    const referenceTo = (name: string): TemplateReference => isBlueprint
        ? { source: TemplateReferenceSource.Blueprint, id: name, blueprint: manifest.name, version: `^${manifest.version}` }
        : { source: TemplateReferenceSource.Own, id: name };

    const applicable: ApplicableTemplate[] = [];
    for (const layout of source.layouts ?? []) {
        if (validateLayoutForTarget(layout, target).length > 0) continue;
        applicable.push({
            package: manifest.name, packageVersion: manifest.version, kind: TemplateCatalogKind.Layout, name: layout.name,
            metadata: layout.metadata, reference: referenceTo(layout.name),
        });
    }
    for (const template of source.screenTemplates ?? []) {
        if (validateScreenTemplateForTarget(template, target).length > 0) continue;
        applicable.push({
            package: manifest.name, packageVersion: manifest.version, kind: TemplateCatalogKind.ScreenTemplate, name: template.name,
            displayName: template.displayName, description: template.description, metadata: template.metadata, reference: referenceTo(template.name),
        });
    }
    for (const template of source.dialogTemplates ?? []) {
        if (validateDialogTemplateForTarget(template, target).length > 0) continue;
        applicable.push({
            package: manifest.name, packageVersion: manifest.version, kind: TemplateCatalogKind.DialogTemplate, name: template.name,
            displayName: template.displayName, description: template.description, metadata: template.metadata, reference: referenceTo(template.name),
        });
    }
    return applicable;
}

function groupByCategory(templates: ApplicableTemplate[]): ApplicableTemplateGroup[] {
    const categoryOf = (template: ApplicableTemplate) => template.metadata?.category?.trim() ? template.metadata.category : undefined;
    const categories = [...new Set(templates.map(categoryOf).filter((category): category is string => category !== undefined))];
    const groups: ApplicableTemplateGroup[] = categories.map(category => ({ category, templates: templates.filter(template => categoryOf(template) === category) }));
    const uncategorized = templates.filter(template => categoryOf(template) === undefined);
    if (uncategorized.length > 0) groups.push({ templates: uncategorized });
    return groups;
}

function withDefaults(problems: string[], name: string, kind: TemplateCatalogKind, metadata: TemplateMetadata | undefined, target: TemplateTarget): string[] {
    if (problems.length > 0 || !Object.values(TemplateScope).includes(target.scope)) return problems;

    if (metadata?.scopes === undefined && !defaultScopes(kind, metadata).includes(target.scope)) {
        return [`Template '${name}' is not offered at scope '${target.scope}' unless it declares that scope`];
    }

    if (target.scope === TemplateScope.Slice && target.sliceKind !== undefined) {
        const sliceKind = target.sliceKind;
        if (!Object.values(SliceKind).includes(sliceKind)) return [`Template '${name}' has unknown target slice kind '${sliceKind}'`];
        if (sliceKind === SliceKind.Automation) return [`Template '${name}' cannot be applied to an Automation slice, which has no presentation`];
        const kinds = metadata?.sliceKinds ?? defaultSliceKinds(kind);
        if (!kinds.includes(sliceKind)) return [`Template '${name}' does not apply to slice kind '${sliceKind}'`];
    }
    return [];
}

function defaultScopes(kind: TemplateCatalogKind, metadata: TemplateMetadata | undefined): TemplateScope[] {
    switch (kind) {
        case TemplateCatalogKind.Layout: return [TemplateScope.Application];
        case TemplateCatalogKind.DialogTemplate: return [TemplateScope.Slice];
        default: return metadata?.sliceKinds === undefined ? screenScopes : [TemplateScope.Slice];
    }
}

function defaultSliceKinds(kind: TemplateCatalogKind): SliceKind[] {
    return kind === TemplateCatalogKind.DialogTemplate ? dialogSliceKinds : screenSliceKinds;
}
