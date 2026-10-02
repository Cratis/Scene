// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneEditKind } from '@cratis/scene.model';
import { createLayoutDocument, homeContext, mainSlot, pageContext, sideSlot, stackPanel } from '../given/a_layout_document';
import { flowNodeId } from '../index';
import { apply, codesOf, elementIds } from './given/edits';

type Document = ReturnType<typeof createLayoutDocument>;
type FlowChild = { children?: FlowChild[]; content?: { id: string } };
const side = (model: Document) => model.screenTemplates[0].content!.side;
const root = (model: Document) => (model.screenTemplates[0].slots[0].arrangement as unknown as { root: { children: FlowChild[] } }).root;

describe('when moving a node', () => {
    const document = createLayoutDocument();
    const row = flowNodeId(mainSlot, 'root', [0]);

    it('should reorder within a panel, ending at the position given', () => {
        const outcome = apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:g', target: 'element:stack', index: 1 }, pageContext());
        outcome.applied.should.be.true;
        elementIds((side(outcome.model)[0] as unknown as { children: unknown[] }).children).should.deep.equal(['h', 'g']);
    });

    it('should reparent an element into another panel', () => {
        const withTwo = structuredClone(document);
        withTwo.screenTemplates[0].content!.side.push(stackPanel('other', []));
        const outcome = apply(withTwo, { kind: SceneEditKind.MoveNode, nodeId: 'element:g', target: 'element:other' }, pageContext());
        outcome.applied.should.be.true;
        elementIds((side(outcome.model)[0] as unknown as { children: unknown[] }).children).should.deep.equal(['h']);
        elementIds((side(outcome.model)[2] as unknown as { children: unknown[] }).children).should.deep.equal(['g']);
    });

    it('should move an element into a flow container by wrapping it in a leaf', () => {
        const outcome = apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:i', target: row, index: 0 }, pageContext());
        outcome.applied.should.be.true;
        elementIds(root(outcome.model).children[0].children!).should.deep.equal(['i', 'a', 'b']);
        elementIds(side(outcome.model)).should.deep.equal(['stack']);
    });

    it('should take an element out of its flow leaf and drop the leaf', () => {
        const outcome = apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:a', target: sideSlot }, pageContext());
        outcome.applied.should.be.true;
        elementIds(root(outcome.model).children[0].children!).should.deep.equal(['b']);
        elementIds(side(outcome.model)).should.deep.equal(['stack', 'i', 'a']);
    });

    it('should move a flow node up a level, even when its removal shifts the destination\'s address', () => {
        const outcome = apply(document, { kind: SceneEditKind.MoveNode, nodeId: flowNodeId(mainSlot, 'root', [0, 0]), target: flowNodeId(mainSlot, 'root', []), index: 1 }, pageContext());
        outcome.applied.should.be.true;
        elementIds(root(outcome.model).children[0].children!).should.deep.equal(['b']);
        root(outcome.model).children.map(child => child.children ? 'row' : child.content!.id).should.deep.equal(['row', 'a', 'c']);
    });

    it('should refuse to move a node into itself', () => {
        codesOf(apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:stack', target: 'element:stack' }, pageContext())).should.deep.equal([DiagnosticCode.ContainmentCycle]);
    });

    it('should refuse to move a container into something inside it', () => {
        const nested = structuredClone(document);
        (nested.screenTemplates[0].content!.side[0] as unknown as { children: unknown[] }).children.push(stackPanel('inner', []));
        codesOf(apply(nested, { kind: SceneEditKind.MoveNode, nodeId: 'element:stack', target: 'element:inner' }, pageContext())).should.deep.equal([DiagnosticCode.ContainmentCycle]);
    });

    it('should refuse to move a flow container into its own descendant', () => {
        const nested = structuredClone(document);
        (root(nested).children[0].children as unknown[]).push({ kind: 'Row', gap: 0, children: [] });
        codesOf(apply(nested, { kind: SceneEditKind.MoveNode, nodeId: row, target: flowNodeId(mainSlot, 'root', [0, 2]) }, pageContext())).should.deep.equal([DiagnosticCode.ContainmentCycle]);
    });

    it('should refuse a flow node going somewhere that is not a flow container', () => {
        codesOf(apply(document, { kind: SceneEditKind.MoveNode, nodeId: flowNodeId(mainSlot, 'root', [1]), target: sideSlot }, pageContext())).should.deep.equal([DiagnosticCode.InvalidEdit]);
    });

    it('should refuse a position that does not exist', () => {
        codesOf(apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:g', target: 'element:stack', index: 5 }, pageContext())).should.deep.equal([DiagnosticCode.IndexOutOfRange]);
    });

    it('should refuse a node that cannot be moved on its own', () => {
        codesOf(apply(document, { kind: SceneEditKind.MoveNode, nodeId: flowNodeId(mainSlot, 'root', []), target: sideSlot }, pageContext())).should.deep.equal([DiagnosticCode.NodeNotRemovable]);
    });

    it('should refuse an inherited node and an inherited target', () => {
        codesOf(apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:g', target: 'screen:Home#slot:side' }, homeContext())).should.deep.equal([DiagnosticCode.NodeNotEditable]);
        codesOf(apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:j', target: sideSlot }, homeContext())).should.deep.equal([DiagnosticCode.NodeNotEditable]);
    });

    it('should move a freeform element into a slot, leaving no placements behind', () => {
        const outcome = apply(document, { kind: SceneEditKind.MoveNode, nodeId: 'element:freeStack', target: sideSlot }, pageContext());
        outcome.applied.should.be.true;
        const variants = (outcome.model.screenTemplates[0].slots[1].arrangement as unknown as { variants: { placements: unknown[] }[] }).variants;
        variants.map(variant => variant.placements.length).should.deep.equal([0, 0]);
        elementIds(side(outcome.model)).should.deep.equal(['stack', 'i', 'freeStack']);
    });
});
