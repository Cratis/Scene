// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ChangeLayoutTypeEdit, DiagnosticCode, FlowContainerKind, LayoutType, Orientation, SceneDiagnostic, SceneDocument,
    SceneNodeKind,
} from '@cratis/scene.model';
import { errorDiagnostic, warningDiagnostic } from './diagnostics';
import { findLayoutTypeDescriptor } from './DescriptorCatalog';
import { getAtPath, mirroredPaths } from './documentPaths';
import { EditSession } from './EditSession';
import { cloneData } from './pathAccess';

type Node = Record<string, unknown>;

interface Conversion {
    result: Node;

    /** Properties that held a real value and are gone after the conversion. */
    lost: string[];
}

const flowKinds: Partial<Record<LayoutType, FlowContainerKind>> = {
    [LayoutType.FlowRow]: FlowContainerKind.Row,
    [LayoutType.FlowColumn]: FlowContainerKind.Column,
    [LayoutType.FlowGrid]: FlowContainerKind.Grid,
};

const panelOwnProperties: Partial<Record<LayoutType, string[]>> = {
    [LayoutType.StackPanel]: ['orientation', 'spacing'],
    [LayoutType.WrapPanel]: ['orientation', 'itemWidth', 'itemHeight'],
    [LayoutType.DockPanel]: ['lastChildFill'],
};

const allPanelOwn = ['orientation', 'spacing', 'itemWidth', 'itemHeight', 'lastChildFill'];

function isSet(node: Node, property: string): boolean {
    return node[property] !== undefined && !(property === 'spacing' && node[property] === 0);
}

function convertFlow(source: Node, to: LayoutType): Conversion {
    const result = cloneData(source);
    const lost: string[] = [];
    const target = flowKinds[to]!;

    if (source.kind === FlowContainerKind.Grid && target !== FlowContainerKind.Grid) {
        for (const property of ['columns', 'rows']) {
            if (source[property] !== undefined) lost.push(property);
            delete result[property];
        }

        const spans = (result.children as Node[]).filter(child => child.span !== undefined);
        if (spans.length > 0) lost.push('span (on children)');
        for (const child of spans) delete child.span;
    }

    result.kind = target;
    return { result, lost };
}

function convertPanel(source: Node, to: LayoutType): Conversion {
    const result = cloneData(source);
    const keep = panelOwnProperties[to] ?? [];
    const lost = allPanelOwn.filter(property => !keep.includes(property) && isSet(source, property));
    for (const property of allPanelOwn.filter(candidate => !keep.includes(candidate))) delete result[property];

    if (to === LayoutType.StackPanel) {
        result.orientation ??= Orientation.Vertical;
        result.spacing ??= 0;
    } else if (to === LayoutType.WrapPanel) {
        result.orientation ??= Orientation.Horizontal;
    } else {
        result.lastChildFill ??= true;
    }

    return { result, lost };
}

/**
 * Applies a layout type change to a copy of the document.
 *
 * A change must be one the layout type allows. Changes that keep everything - row to column, a dock panel to a
 * stack panel - go ahead. Changes that would drop real values, such as a grid's columns and spans when it becomes a
 * row, are refused with the list of what would be lost unless the edit accepts the loss, and then go ahead with a
 * warning that lists the same.
 */
export function applyChangeLayoutType(session: EditSession, edit: ChangeLayoutTypeEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const record = session.index.nodes.get(edit.nodeId);
    if (!record) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownNode, `There is no node '${edit.nodeId}'.`, { nodeId: edit.nodeId }));
        return;
    }

    if (record.kind !== SceneNodeKind.FlowNode && record.kind !== SceneNodeKind.Element) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.NotALayoutNode, `'${record.label}' is not a layout node.`, { nodeId: edit.nodeId }));
        return;
    }

    if (!session.isLocal(record)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.NodeNotEditable, `'${edit.nodeId}' is inherited from '${session.sourceOf(record)}' and cannot be changed here.`, { nodeId: edit.nodeId }));
        return;
    }

    const descriptor = findLayoutTypeDescriptor(session.context.catalog, record.typeId);
    if (!descriptor) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.NotALayoutNode, `'${record.label}' is not a layout node.`, { nodeId: edit.nodeId }));
        return;
    }

    if (!descriptor.capabilities.convertibleTo.includes(edit.to as LayoutType)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.LayoutTypeNotConvertible, `A ${descriptor.label.toLowerCase()} cannot be changed into '${edit.to}'.`, { nodeId: edit.nodeId }));
        return;
    }

    const isFlow = record.kind === SceneNodeKind.FlowNode;
    const conversion = isFlow ? convertFlow(record.value as Node, edit.to as LayoutType) : convertPanel(record.value as Node, edit.to as LayoutType);

    if (conversion.lost.length > 0) {
        const lost = conversion.lost.join(', ');
        if (!edit.acceptLoss) {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.LossyConversionNotAccepted,
                `Changing to '${edit.to}' would drop ${lost}. Accept the loss to go ahead.`,
                { nodeId: edit.nodeId }));
            return;
        }

        diagnostics.push(warningDiagnostic(DiagnosticCode.LossyConversion, `Changed to '${edit.to}'; dropped ${lost}.`, { nodeId: edit.nodeId }));
    }

    for (const path of mirroredPaths(record.mirror, record.path)) {
        const holder = getAtPath(clone, path.slice(0, -1)) as Record<string | number, unknown>;
        holder[path[path.length - 1]] = cloneData(conversion.result);
    }
}
