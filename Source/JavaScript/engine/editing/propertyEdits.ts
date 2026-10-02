// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, DiagnosticSeverity, PropertyDescriptor, PropertyValueType, QueryBinding, ResetPropertyEdit, SceneDiagnostic, SceneDocument,
    SceneNodeKind, SetPropertyEdit,
} from '@cratis/scene.model';
import { describeNode } from './describeNode';
import { errorDiagnostic, hasErrors } from './diagnostics';
import { NodeRecord } from './DocumentIndex';
import { getAtPath, mirroredPaths } from './documentPaths';
import { EditSession } from './EditSession';
import { iconProblemsOfProperty } from './iconDiagnostics';
import { cloneData, removeValueAtPath, setValueAtPath } from './pathAccess';
import { validateBinding } from './validateBinding';
import { validateValue } from './validateValue';

/**
 * Finds the node and descriptor an edit of a property addresses, or says why it cannot.
 */
export function resolveEditableProperty(
    session: EditSession,
    nodeId: string,
    path: string,
    diagnostics: SceneDiagnostic[],
): { record: NodeRecord; descriptor: PropertyDescriptor } | undefined {
    const record = session.index.nodes.get(nodeId);
    if (!record) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownNode, `There is no node '${nodeId}'.`, { nodeId }));
        return undefined;
    }

    if (!session.isLocal(record)) {
        diagnostics.push(errorDiagnostic(
            DiagnosticCode.NodeNotEditable,
            `'${nodeId}' is inherited from '${session.sourceOf(record)}'. An exposed property is configured with an instance edit, not by changing the node.`,
            { nodeId, path }));
        return undefined;
    }

    const description = describeNode(record, session.context.catalog);
    const descriptor = description.properties.find(candidate => candidate.path === path);
    if (!descriptor) {
        diagnostics.push(errorDiagnostic(
            description.diagnostics.length > 0 ? DiagnosticCode.MissingComponentDescriptor : DiagnosticCode.UnknownProperty,
            description.diagnostics[0]?.message ?? `'${record.typeId}' has no property '${path}'.`,
            { nodeId, path }));
        return undefined;
    }

    if (descriptor.readOnly) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ReadOnlyProperty, `'${descriptor.label}' is read-only.`, { nodeId, path }));
        return undefined;
    }

    return { record, descriptor };
}

/**
 * Checks a value for a property, including a query binding against the host's candidates.
 *
 * @returns Whether the value is acceptable; the reasons are added to `diagnostics`.
 */
export function checkValue(session: EditSession, descriptor: PropertyDescriptor, value: unknown, context: { nodeId?: string; component?: string; instance?: string }, diagnostics: SceneDiagnostic[]): boolean {
    const problem = validateValue(descriptor, value);
    if (problem) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidValue, `'${descriptor.label}': ${problem}.`, { ...context, path: descriptor.path }));
        return false;
    }

    const candidates = session.context.queryCandidates;
    if (descriptor.valueType === PropertyValueType.QueryReference && candidates && typeof value === 'object' && value !== null) {
        const binding = value as QueryBinding;
        const problems = validateBinding(descriptor, candidates.find(candidate => candidate.id === binding.queryId), binding);
        diagnostics.push(...problems.map(problemDiagnostic => ({ ...problemDiagnostic, ...context })));
        return problems.length === 0;
    }

    const icons = session.context.iconCatalog;
    if (icons) {
        const problems = iconProblemsOfProperty(icons, descriptor, value, DiagnosticSeverity.Error, context);
        diagnostics.push(...problems);
        return !hasErrors(problems);
    }

    return true;
}

function bagFor(root: SceneDocument, record: NodeRecord, path: string[]): Record<string, unknown> | undefined {
    const target = getAtPath(root, path) as Record<string, unknown> | undefined;
    if (!target) return undefined;
    const isComponent = record.kind === SceneNodeKind.Element && target.componentName !== undefined;
    if (!isComponent) return target;
    return (target.properties ??= {}) as Record<string, unknown>;
}

/**
 * Applies a property set to a copy of the document.
 */
export function applySetProperty(session: EditSession, edit: SetPropertyEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveEditableProperty(session, edit.nodeId, edit.path, diagnostics);
    if (!resolved) return;
    if (!checkValue(session, resolved.descriptor, edit.value, { nodeId: edit.nodeId }, diagnostics)) return;

    for (const path of mirroredPaths(resolved.record.mirror, resolved.record.path)) {
        const bag = bagFor(clone, resolved.record, path as string[]);
        if (bag) setValueAtPath(bag, edit.path, cloneData(edit.value));
    }
}

/**
 * Applies a property reset to a copy of the document.
 */
export function applyResetProperty(session: EditSession, edit: ResetPropertyEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveEditableProperty(session, edit.nodeId, edit.path, diagnostics);
    if (!resolved) return;

    if (resolved.descriptor.constraints?.required && resolved.descriptor.default === undefined) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidValue, `'${resolved.descriptor.label}' is required and has no default to go back to.`, { nodeId: edit.nodeId, path: edit.path }));
        return;
    }

    for (const path of mirroredPaths(resolved.record.mirror, resolved.record.path)) {
        const bag = bagFor(clone, resolved.record, path as string[]);
        if (bag) removeValueAtPath(bag, edit.path);
    }
}
