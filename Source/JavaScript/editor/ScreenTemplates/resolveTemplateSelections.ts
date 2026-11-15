// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateCandidate } from './TemplateCandidate';
import type { SliceKind } from '@cratis/scene.model';
import { TemplateCatalog } from './TemplateCatalog';
import { TemplateDiagnostic } from './TemplateDiagnostic';
import { TemplateDiagnosticKind } from './TemplateDiagnosticKind';
import { TemplateLevel } from './TemplateLevel';
import { TemplateNode } from './TemplateNode';
import { TemplateReference } from './TemplateReference';
import { TemplateReferenceKind } from './TemplateReferenceKind';
import { TemplateSelection } from './TemplateSelection';
import { TemplateSelections } from './TemplateSelections';
import { applicationTemplateNodeId } from './applicationTemplateNodeId';
import { findTemplateCandidate } from './findTemplateCandidate';
import { applicableTemplatesAt, isTemplateApplicable } from './applicableTemplatesAt';
import { parseTemplateReference } from './parseTemplateReference';

/**
 * Works out which template is in effect at every level of the hierarchy.
 *
 * A level that chose a template uses it; a level that did not takes the nearest ancestor's, up to the
 * application's default. Because that is computed from the choices rather than copied down, changing a parent
 * reaches every inheriting descendant and leaves explicit overrides alone, and resetting a level is simply
 * clearing its choice.
 *
 * Nothing is dropped. A choice nothing provides any more, or one that no longer fits what is above it, stays
 * in effect with a diagnostic on the level that made it.
 *
 * @param applicationDefault The application's stored default template, empty for none.
 * @param nodes Every module, feature, sub-feature and slice with the template it chose.
 * @param catalog The templates that exist.
 * @returns The {@link TemplateSelections}.
 */
export function resolveTemplateSelections(applicationDefault: string | undefined, nodes: TemplateNode[], catalog: TemplateCatalog): TemplateSelections {
    const byId = new Map(nodes.map(node => [node.id, node]));
    const resolved = new Map<string, TemplateSelection>();
    const application = choose(applicationTemplateNodeId, TemplateLevel.Application, undefined, parseTemplateReference(applicationDefault), undefined, catalog);

    const resolve = (id: string, visiting: Set<string>): TemplateSelection => {
        const known = resolved.get(id);
        if (known) return known;

        const node = byId.get(id)!;
        const parent = node.parentId && byId.has(node.parentId) && !visiting.has(node.parentId)
            ? resolve(node.parentId, new Set([...visiting, id]))
            : application;
        const selection = choose(node.id, node.level, node.sliceKind, parseTemplateReference(node.explicit), parent, catalog);
        resolved.set(id, selection);
        return selection;
    };

    for (const node of nodes) resolve(node.id, new Set());
    return { application, nodes: resolved };
}

function choose(nodeId: string, level: TemplateLevel, sliceKind: SliceKind | undefined, explicit: TemplateReference | undefined, parent: TemplateSelection | undefined, catalog: TemplateCatalog): TemplateSelection {
    const blueprintAbove = parent ? (parent.candidate?.reference.kind === TemplateReferenceKind.Blueprint ? parent.candidate : parent.blueprintAbove) : undefined;
    const aboveChain = parent?.chain ?? [];

    if (!explicit) {
        return {
            nodeId,
            level,
            sliceKind,
            isExplicit: false,
            reference: parent?.reference,
            candidate: parent?.candidate,
            inheritedFrom: parent?.isExplicit ? { level: parent.level, nodeId: parent.nodeId === applicationTemplateNodeId ? undefined : parent.nodeId } : parent?.inheritedFrom,
            diagnostics: [],
            chain: aboveChain,
            blueprintAbove,
        };
    }

    const candidate = findTemplateCandidate(catalog, explicit);
    return {
        nodeId,
        level,
        sliceKind,
        isExplicit: true,
        reference: explicit,
        candidate,
        diagnostics: diagnose(explicit, candidate, { level, sliceKind, blueprintAbove, chain: aboveChain }, parent, catalog),
        chain: sameReference(aboveChain[aboveChain.length - 1], explicit) ? aboveChain : [...aboveChain, explicit],
        blueprintAbove,
    };
}

// A choice that Scene would not offer at the level is incompatible - the same rule the picker lists by, so a template can
// never be offered and then reported as not fitting.
function diagnose(reference: TemplateReference, candidate: TemplateCandidate | undefined, where: Pick<TemplateSelection, 'level' | 'sliceKind' | 'blueprintAbove' | 'chain'>, parent: TemplateSelection | undefined, catalog: TemplateCatalog): TemplateDiagnostic[] {
    if (!candidate) return [{ kind: TemplateDiagnosticKind.Missing, reference }];
    if (sameReference(parent?.reference, reference)) return [];
    if (!catalog.layout && candidate.reference.kind === TemplateReferenceKind.Blueprint) return [];
    if (isTemplateApplicable(applicableTemplatesAt({ ...where, reference }, catalog), reference)) return [];
    return [{ kind: TemplateDiagnosticKind.Incompatible, reference, container: where.blueprintAbove?.template?.name ?? catalog.layout?.name }];
}

function sameReference(left: TemplateReference | undefined, right: TemplateReference | undefined): boolean {
    return left !== undefined && right !== undefined && left.kind === right.kind && left.id.toLowerCase() === right.id.toLowerCase();
}
