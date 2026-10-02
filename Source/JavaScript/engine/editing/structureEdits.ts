// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, FlowNode, InsertNodeEdit, MoveNodeEdit, RemoveNodeEdit, SceneDiagnostic, SceneDocument, SceneElement,
    SceneNodeKind,
} from '@cratis/scene.model';
import { isExternalComponent, isPanel } from '../elementKind';
import { errorDiagnostic } from './diagnostics';
import { DocumentPath, NodeRecord } from './DocumentIndex';
import { elementNodeId } from './nodeIds';
import { ensureArrayAt, getAtPath, mirroredPaths } from './documentPaths';
import { EditSession } from './EditSession';
import { findLayoutTypeDescriptor } from './DescriptorCatalog';
import { cloneData } from './pathAccess';

/**
 * Where an insert or move puts its node: the arrays (one per freeform size-class copy) and what they hold.
 */
interface InsertionPoint {
    record: NodeRecord;
    paths: DocumentPath[];

    /** Whether the arrays hold flow nodes (and wrap elements in a leaf) or elements directly. */
    flow: boolean;
}

function elementIdsIn(value: unknown, found: string[] = []): string[] {
    if (value === null || typeof value !== 'object') return found;
    if (Array.isArray(value)) {
        for (const item of value) elementIdsIn(item, found);
        return found;
    }

    const candidate = value as { id?: unknown; properties?: unknown };
    if (typeof candidate.id === 'string' && candidate.properties !== null && typeof candidate.properties === 'object') found.push(candidate.id);
    for (const child of Object.values(value)) elementIdsIn(child, found);
    return found;
}

function resolveInsertionPoint(session: EditSession, targetId: string, slot: string | undefined, diagnostics: SceneDiagnostic[]): InsertionPoint | undefined {
    const record = session.index.nodes.get(targetId);
    const refuse = (code: DiagnosticCode, message: string) => {
        diagnostics.push(errorDiagnostic(code, message, { nodeId: targetId }));
        return undefined;
    };

    if (!record) return refuse(DiagnosticCode.UnknownNode, `There is no node '${targetId}'.`);
    if (!session.isLocal(record)) return refuse(DiagnosticCode.NodeNotEditable, `'${targetId}' is inherited from '${session.sourceOf(record)}' and cannot be changed here.`);

    const paths = (path: DocumentPath) => mirroredPaths(record.mirror, path);
    switch (record.kind) {
        case SceneNodeKind.Slot:
            return record.contentPath
                ? { record, paths: paths(record.contentPath), flow: false }
                : refuse(DiagnosticCode.TargetDoesNotAcceptChildren, `'${record.label}' is a slot of a layout; a layout declares slots and screens fill them.`);

        case SceneNodeKind.FlowNode:
            return record.typeId === 'flowLeaf' || record.typeId === 'flowSlotLeaf'
                ? refuse(DiagnosticCode.TargetDoesNotAcceptChildren, 'A flow leaf holds one element and takes no children; insert into its container.')
                : { record, paths: paths([...record.path, 'children']), flow: true };

        case SceneNodeKind.Element: {
            const element = record.value as SceneElement;
            if (isExternalComponent(element)) {
                return slot
                    ? { record, paths: paths([...record.path, 'slots', slot]), flow: false }
                    : refuse(DiagnosticCode.UnknownSlot, `Say which slot of '${element.componentName}' to insert into.`);
            }

            return isPanel(element)
                ? { record, paths: paths([...record.path, 'children']), flow: false }
                : refuse(DiagnosticCode.TargetDoesNotAcceptChildren, `'${record.label}' holds a single element and takes no children.`);
        }

        default:
            return refuse(DiagnosticCode.TargetDoesNotAcceptChildren, `'${record.label}' does not take children. Freeform arrangements place elements through their placements.`);
    }
}

function checkCapacity(session: EditSession, point: InsertionPoint, current: number, diagnostics: SceneDiagnostic[]): boolean {
    const maximum = findLayoutTypeDescriptor(session.context.catalog, point.record.typeId)?.capabilities.maximumChildren;
    if (maximum !== undefined && current >= maximum) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.MaximumChildrenExceeded, `'${point.record.label}' holds at most ${maximum} children.`, { nodeId: point.record.id }));
        return false;
    }

    return true;
}

function insertInto(session: EditSession, clone: SceneDocument, point: InsertionPoint, payload: SceneElement | FlowNode, isFlowNode: boolean, index: number | undefined, diagnostics: SceneDiagnostic[]): void {
    if (isFlowNode && !point.flow) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, 'A flow node can only go into a flow container.', { nodeId: point.record.id }));
        return;
    }

    const arrays = point.paths.map(path => ensureArrayAt(clone, path));
    const length = arrays[0].length;
    if (index !== undefined && (!Number.isInteger(index) || index < 0 || index > length)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.IndexOutOfRange, `There is no position ${index} among ${length} children.`, { nodeId: point.record.id }));
        return;
    }

    if (!checkCapacity(session, point, length, diagnostics)) return;

    for (const array of arrays) {
        const node = point.flow && !isFlowNode ? { content: cloneData(payload) } : cloneData(payload);
        array.splice(index ?? array.length, 0, node);
    }
}

/**
 * Applies an insert to a copy of the document.
 */
export function applyInsertNode(session: EditSession, edit: InsertNodeEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    if ((edit.element === undefined) === (edit.flowNode === undefined)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, 'Give exactly one of element and flowNode.', { nodeId: edit.target }));
        return;
    }

    const point = resolveInsertionPoint(session, edit.target, edit.slot, diagnostics);
    if (!point) return;

    const identities = elementIdsIn(edit.element ?? edit.flowNode);
    const duplicate = identities.find((identity, position) => identities.indexOf(identity) !== position || session.index.nodes.has(elementNodeId(identity)));
    if (duplicate !== undefined) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ElementIdInUse, `The element id '${duplicate}' is already used.`, { nodeId: edit.target }));
        return;
    }

    insertInto(session, clone, point, (edit.element ?? edit.flowNode)!, edit.flowNode !== undefined, edit.index, diagnostics);
}

interface Removal {
    /** The list record whose array holds the node being taken out (a flow leaf for an element it wraps). */
    holder: NodeRecord;
    payload: SceneElement | FlowNode;
    isFlowNode: boolean;
}

function resolveRemoval(session: EditSession, nodeId: string, diagnostics: SceneDiagnostic[]): Removal | undefined {
    const record = session.index.nodes.get(nodeId);
    if (!record) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownNode, `There is no node '${nodeId}'.`, { nodeId }));
        return undefined;
    }

    if (!session.isLocal(record)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.NodeNotEditable, `'${nodeId}' is inherited from '${session.sourceOf(record)}' and cannot be changed here.`, { nodeId }));
        return undefined;
    }

    const holder = record.leafId !== undefined ? session.index.nodes.get(record.leafId)! : record;
    const isElement = record.kind === SceneNodeKind.Element;
    const removable = holder.list !== undefined || (isElement && record.placementIds !== undefined);
    if (!removable || (record.kind !== SceneNodeKind.Element && record.kind !== SceneNodeKind.FlowNode)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.NodeNotRemovable, `'${record.label}' cannot be moved or removed on its own.`, { nodeId }));
        return undefined;
    }

    return { holder: isElement && record.placementIds !== undefined ? record : holder, payload: record.value as SceneElement | FlowNode, isFlowNode: !isElement };
}

function takeOut(session: EditSession, clone: SceneDocument, removal: Removal): void {
    const { holder } = removal;
    if (holder.placementIds !== undefined && holder.kind === SceneNodeKind.Element) {
        for (const placementId of holder.placementIds) {
            const placement = session.index.nodes.get(placementId)!;
            const array = getAtPath(clone, placement.list!.path) as unknown[];
            array.splice(placement.list!.index, 1);
        }

        return;
    }

    for (const path of mirroredPaths(holder.mirror, holder.list!.path)) {
        const index = holder.list!.index;
        (getAtPath(clone, path) as unknown[]).splice(index, 1);
    }
}

/**
 * Applies a removal to a copy of the document. Removing an element a flow leaf holds removes the leaf too, and
 * removing a freeform element removes its placement in every size-class variant.
 */
export function applyRemoveNode(session: EditSession, edit: RemoveNodeEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const removal = resolveRemoval(session, edit.nodeId, diagnostics);
    if (removal) takeOut(session, clone, removal);
}

/**
 * Applies a move - a reorder or a reparent - to a copy of the document.
 *
 * `index` is the position the node ends up at among its new siblings. The destination arrays are located before
 * anything is taken out, so removing a sibling that shifts the destination's own address does not misdirect the
 * insert.
 */
export function applyMoveNode(session: EditSession, edit: MoveNodeEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const removal = resolveRemoval(session, edit.nodeId, diagnostics);
    if (!removal) return;

    const point = resolveInsertionPoint(session, edit.target, edit.slot, diagnostics);
    if (!point) return;

    const moved = session.index.nodes.get(edit.nodeId)!;
    for (let ancestor: NodeRecord | undefined = point.record; ancestor; ancestor = ancestor.parentId === undefined ? undefined : session.index.nodes.get(ancestor.parentId)) {
        if (ancestor.id === moved.id) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.ContainmentCycle, `'${moved.label}' cannot be moved into itself or something inside it.`, { nodeId: edit.nodeId }));
            return;
        }
    }

    const payload = cloneData(removal.payload);
    const arrays = point.paths.map(path => ensureArrayAt(clone, path));
    takeOut(session, clone, removal);

    if (removal.isFlowNode && !point.flow) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, 'A flow node can only go into a flow container.', { nodeId: edit.nodeId }));
        return;
    }

    const length = arrays[0].length;
    if (edit.index !== undefined && (!Number.isInteger(edit.index) || edit.index < 0 || edit.index > length)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.IndexOutOfRange, `There is no position ${edit.index} among ${length} children.`, { nodeId: edit.target }));
        return;
    }

    if (!checkCapacity(session, point, length, diagnostics)) return;

    for (const array of arrays) {
        const node = point.flow && !removal.isFlowNode ? { content: cloneData(payload) } : cloneData(payload);
        array.splice(edit.index ?? array.length, 0, node);
    }
}
