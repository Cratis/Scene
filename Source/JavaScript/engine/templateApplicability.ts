// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Layout, ScreenTemplate, TemplateMetadata, TemplateScope } from '@cratis/scene.model';

type TemplateKind = 'Layout' | 'ScreenTemplate' | 'DialogTemplate';
type TemplateContainer = Pick<Layout, 'name' | 'slots'>;

/** Validates application-shell selection without introducing a competing shell model. */
export function validateLayoutApplicability(layout: Layout | undefined, scope: TemplateScope): string[] {
    return layout ? validateRole(layout.name, 'Layout', layout.metadata, scope) : [];
}

/**
 * Validates selection at any depth of the application hierarchy, including qualified fitsSlot names.
 * Undefined represents outlet-only composition and is valid. Invalid author input is never rewritten.
 */
export function validateScreenTemplateApplicability(
    template: ScreenTemplate | undefined,
    scope: TemplateScope,
    container?: TemplateContainer,
): string[] {
    if (!template) return [];
    const problems = validateRole(template.name, 'ScreenTemplate', template.metadata, scope);
    if (template.fitsSlot !== undefined) {
        const separator = template.fitsSlot.lastIndexOf('.');
        const qualifier = separator < 0 ? undefined : template.fitsSlot.slice(0, separator);
        const slot = separator < 0 ? template.fitsSlot : template.fitsSlot.slice(separator + 1);
        if (!container || (qualifier !== undefined && qualifier !== container.name) || !container.slots.some(candidate => candidate.name === slot)) {
            problems.push(`Template '${template.name}' does not fit slot '${template.fitsSlot}' on '${container?.name ?? '(no container)'}'`);
        }
    }
    return problems;
}

/** Validates an overlay template separately from slot-based screen composition. */
export function validateDialogTemplateApplicability(template: DialogTemplate | undefined, scope: TemplateScope): string[] {
    return template ? validateRole(template.name, 'DialogTemplate', template.metadata, scope) : [];
}

/** The shared picker predicate uses exactly the same rules as validation on apply. */
export function filterApplicableScreenTemplates(
    templates: readonly ScreenTemplate[],
    scope: TemplateScope,
    container?: TemplateContainer,
): ScreenTemplate[] {
    return templates.filter(template => validateScreenTemplateApplicability(template, scope, container).length === 0);
}

function validateRole(name: string, kind: TemplateKind, metadata: TemplateMetadata | undefined, scope: TemplateScope): string[] {
    const problems: string[] = [];
    if (!Object.values(TemplateScope).includes(scope)) {
        problems.push(`Template '${name}' has unknown target scope '${scope}'`);
    } else if ((kind === 'Layout') !== (scope === TemplateScope.Application)) {
        problems.push(`Template '${name}' of kind '${kind}' cannot be applied at scope '${scope}'`);
    }
    if (metadata?.type === 'ApplicationShell' && kind !== 'Layout') {
        problems.push(`Template '${name}' of type 'ApplicationShell' must be a Layout`);
    }
    if (metadata?.type === 'Dialog' && kind !== 'DialogTemplate') {
        problems.push(`Template '${name}' of type 'Dialog' must be a DialogTemplate`);
    }
    if (kind === 'Layout' && ['Workspace', 'List', 'Detail', 'Form'].includes(metadata?.type ?? '')) {
        problems.push(`Template '${name}' of type '${metadata?.type}' must not be a Layout`);
    }
    for (const declaredScope of metadata?.scopes ?? []) {
        if (!Object.values(TemplateScope).includes(declaredScope)) {
            problems.push(`Template '${name}' declares unknown scope '${declaredScope}'`);
        }
    }
    if (metadata?.scopes !== undefined && !metadata.scopes.includes(scope)) {
        problems.push(`Template '${name}' does not declare scope '${scope}'`);
    }
    return problems;
}
