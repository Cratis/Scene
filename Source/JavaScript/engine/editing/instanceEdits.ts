// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    AddCollectionItemEdit, CollectionOperation, ContributedItem, DiagnosticCode, EditCollectionItemEdit, InstanceContribution,
    PropertyValueType, RemoveCollectionItemEdit, ReorderCollectionItemEdit, ResetInstanceValueEdit, SceneDiagnostic,
    SceneDocument, SetInstanceValueEdit,
} from '@cratis/scene.model';
import { errorDiagnostic } from './diagnostics';
import { EditSession } from './EditSession';
import { ExposureGrant, grantKey } from './exposureGrants';
import { cloneData } from './pathAccess';
import { checkValue } from './propertyEdits';
import { validateItemValues } from './validateValue';

interface InstanceEditTarget {
    instance: string;
    component: string;
    path: string;
}

function resolveGrant(session: EditSession, edit: InstanceEditTarget & { instance?: string }, diagnostics: SceneDiagnostic[]): { instance: string; grant: ExposureGrant } | undefined {
    const context = { instance: edit.instance, component: edit.component, path: edit.path };
    const instance = session.scopeInstance;
    if (instance === undefined) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownScope, `There is no ${session.context.scope.kind} named '${session.context.scope.name}'.`, context));
        return undefined;
    }

    if (edit.instance !== undefined && edit.instance !== instance) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownInstance, `Edits are made as '${instance}', not as '${edit.instance}'.`, context));
        return undefined;
    }

    const grant = session.scopeGrants.get(grantKey(edit.component, edit.path));
    if (!grant) {
        diagnostics.push(errorDiagnostic(
            DiagnosticCode.ContributionNotExposed,
            `'${edit.path}' on '${edit.component}' is not exposed to '${instance}'. An owner exposes it, and each template between re-exposes it.`,
            { ...context, instance }));
        return undefined;
    }

    return { instance, grant };
}

function findContribution(clone: SceneDocument, instance: string, component: string, path: string): InstanceContribution | undefined {
    return clone.instanceContributions.find(contribution =>
        contribution.instance === instance && contribution.component === component && contribution.path === path);
}

function permitted(grant: ExposureGrant, operation: CollectionOperation, instance: string, diagnostics: SceneDiagnostic[]): boolean {
    if (grant.descriptor.valueType !== PropertyValueType.Collection) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, `'${grant.descriptor.label}' is not a collection.`, { instance, component: grant.component, path: grant.path }));
        return false;
    }

    if (!grant.operations.includes(operation)) {
        diagnostics.push(errorDiagnostic(
            DiagnosticCode.ContributionOperationNotPermitted,
            `'${grant.descriptor.label}' does not allow '${operation}' from '${instance}'.`,
            { instance, component: grant.component, path: grant.path }));
        return false;
    }

    return true;
}

function checkFields(grant: ExposureGrant, values: Record<string, unknown>, itemId: string, instance: string, diagnostics: SceneDiagnostic[], requireAll: boolean): boolean {
    const context = { instance, component: grant.component, path: grant.path, itemId };
    let valid = true;

    for (const field of Object.keys(values)) {
        const known = grant.descriptor.item?.properties.some(candidate => candidate.path === field) ?? false;
        if (known && grant.editableFields !== undefined && !grant.editableFields.includes(field)) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.ContributionOperationNotPermitted, `The field '${field}' of '${grant.descriptor.label}' is not exposed for editing.`, context));
            valid = false;
        }
    }

    const itemDescriptor = grant.descriptor.item;
    const problems = validateItemValues(itemDescriptor, values).filter(problem => requireAll || problem.problem !== 'a value is required');
    for (const problem of problems) {
        diagnostics.push(errorDiagnostic(
            problem.problem.startsWith('is not a field') ? DiagnosticCode.UnknownCollectionField : DiagnosticCode.InvalidValue,
            `'${problem.field}' ${problem.problem}.`,
            context));
        valid = false;
    }

    return valid;
}

function ownItems(clone: SceneDocument, instance: string, grant: ExposureGrant): { contribution: InstanceContribution | undefined; items: ContributedItem[] } {
    const contribution = findContribution(clone, instance, grant.component, grant.path);
    return { contribution, items: contribution?.items ?? [] };
}

function save(clone: SceneDocument, instance: string, grant: ExposureGrant, existing: InstanceContribution | undefined, items: ContributedItem[]): void {
    if (items.length === 0) {
        if (existing) clone.instanceContributions.splice(clone.instanceContributions.indexOf(existing), 1);
        return;
    }

    if (existing) existing.items = items;
    else clone.instanceContributions.push({ instance, component: grant.component, path: grant.path, items });
}

/**
 * Applies a scalar value set from the editing scope's instance to a copy of the document.
 */
export function applySetInstanceValue(session: EditSession, edit: SetInstanceValueEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveGrant(session, { ...edit, instance: edit.instance } as InstanceEditTarget, diagnostics);
    if (!resolved) return;

    if (resolved.grant.descriptor.valueType === PropertyValueType.Collection) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, `'${resolved.grant.descriptor.label}' is a collection; add, remove, reorder and edit its items instead.`, { instance: resolved.instance, component: edit.component, path: edit.path }));
        return;
    }

    if (!checkValue(session, resolved.grant.descriptor, edit.value, { component: edit.component, instance: resolved.instance }, diagnostics)) return;

    const existing = findContribution(clone, resolved.instance, edit.component, edit.path);
    if (existing) existing.value = cloneData(edit.value);
    else clone.instanceContributions.push({ instance: resolved.instance, component: edit.component, path: edit.path, value: cloneData(edit.value) });
}

/**
 * Applies a reset to a copy of the document: the instance's contribution is removed, so the inherited value applies.
 */
export function applyResetInstanceValue(session: EditSession, edit: ResetInstanceValueEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveGrant(session, edit as InstanceEditTarget, diagnostics);
    if (!resolved) return;

    const existing = findContribution(clone, resolved.instance, edit.component, edit.path);
    if (existing) clone.instanceContributions.splice(clone.instanceContributions.indexOf(existing), 1);
}

/**
 * Applies an item addition to a copy of the document.
 */
export function applyAddCollectionItem(session: EditSession, edit: AddCollectionItemEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveGrant(session, edit as InstanceEditTarget, diagnostics);
    if (!resolved || !permitted(resolved.grant, CollectionOperation.Add, resolved.instance, diagnostics)) return;

    const { grant, instance } = resolved;
    const context = { instance, component: edit.component, path: edit.path, itemId: edit.item.id };
    if (typeof edit.item.id !== 'string' || edit.item.id.length === 0) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidValue, 'An item needs an id.', context));
        return;
    }

    const effective = session.configuration.components.find(candidate => candidate.component === edit.component)?.values.find(value => value.path === edit.path);
    const existingItems = effective?.items ?? [];
    if (existingItems.some(item => item.id === edit.item.id)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.DuplicateCollectionItem, `The item id '${edit.item.id}' is already used.`, context));
        return;
    }

    const maximum = grant.descriptor.constraints?.maximumItems;
    if (maximum !== undefined && existingItems.length >= maximum) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidValue, `'${grant.descriptor.label}' allows at most ${maximum} items.`, context));
        return;
    }

    if (!checkFields(grant, edit.item.values, edit.item.id, instance, diagnostics, true)) return;

    const { contribution, items } = ownItems(clone, instance, grant);
    if (edit.index !== undefined && (!Number.isInteger(edit.index) || edit.index < 0 || edit.index > items.length)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.IndexOutOfRange, `There is no position ${edit.index} among ${items.length} items.`, context));
        return;
    }

    const next = [...items];
    next.splice(edit.index ?? next.length, 0, cloneData(edit.item));
    save(clone, instance, grant, contribution, next);
}

function findOwnItem(items: ContributedItem[], itemId: string, instance: string, grant: ExposureGrant, session: EditSession, diagnostics: SceneDiagnostic[]): number {
    const position = items.findIndex(item => item.id === itemId);
    if (position >= 0) return position;

    const effective = session.configuration.components.find(candidate => candidate.component === grant.component)?.values.find(value => value.path === grant.path);
    const fixed = effective?.items?.find(item => item.id === itemId);
    diagnostics.push(errorDiagnostic(
        fixed ? DiagnosticCode.ContributionOperationNotPermitted : DiagnosticCode.CollectionItemNotFound,
        fixed ? `The item '${itemId}' belongs to '${fixed.origin}' and cannot be changed from '${instance}'.` : `'${instance}' has no item '${itemId}' in '${grant.descriptor.label}'.`,
        { instance, component: grant.component, path: grant.path, itemId }));
    return -1;
}

/**
 * Applies an item removal to a copy of the document.
 */
export function applyRemoveCollectionItem(session: EditSession, edit: RemoveCollectionItemEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveGrant(session, edit as InstanceEditTarget, diagnostics);
    if (!resolved || !permitted(resolved.grant, CollectionOperation.Remove, resolved.instance, diagnostics)) return;

    const { contribution, items } = ownItems(clone, resolved.instance, resolved.grant);
    const position = findOwnItem(items, edit.itemId, resolved.instance, resolved.grant, session, diagnostics);
    if (position < 0) return;

    save(clone, resolved.instance, resolved.grant, contribution, items.filter((_, index) => index !== position));
}

/**
 * Applies an item reorder to a copy of the document.
 */
export function applyReorderCollectionItem(session: EditSession, edit: ReorderCollectionItemEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveGrant(session, edit as InstanceEditTarget, diagnostics);
    if (!resolved || !permitted(resolved.grant, CollectionOperation.Reorder, resolved.instance, diagnostics)) return;

    const { contribution, items } = ownItems(clone, resolved.instance, resolved.grant);
    const position = findOwnItem(items, edit.itemId, resolved.instance, resolved.grant, session, diagnostics);
    if (position < 0) return;

    if (!Number.isInteger(edit.index) || edit.index < 0 || edit.index >= items.length) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.IndexOutOfRange, `There is no position ${edit.index} among ${items.length} items.`, { instance: resolved.instance, component: edit.component, path: edit.path, itemId: edit.itemId }));
        return;
    }

    const next = [...items];
    const [moved] = next.splice(position, 1);
    next.splice(edit.index, 0, moved);
    save(clone, resolved.instance, resolved.grant, contribution, next);
}

/**
 * Applies an item field change to a copy of the document.
 */
export function applyEditCollectionItem(session: EditSession, edit: EditCollectionItemEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const resolved = resolveGrant(session, edit as InstanceEditTarget, diagnostics);
    if (!resolved || !permitted(resolved.grant, CollectionOperation.EditFields, resolved.instance, diagnostics)) return;

    const { contribution, items } = ownItems(clone, resolved.instance, resolved.grant);
    const position = findOwnItem(items, edit.itemId, resolved.instance, resolved.grant, session, diagnostics);
    if (position < 0) return;

    if (!checkFields(resolved.grant, { [edit.field]: edit.value }, edit.itemId, resolved.instance, diagnostics, false)) return;

    const next = items.map((item, index) => index === position ? { ...item, values: { ...item.values, [edit.field]: cloneData(edit.value) } } : item);
    save(clone, resolved.instance, resolved.grant, contribution, next);
}
