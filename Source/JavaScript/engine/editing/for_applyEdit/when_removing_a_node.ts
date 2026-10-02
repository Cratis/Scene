// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneEditKind } from '@cratis/scene.model';
import { createLayoutDocument, homeContext, mainSlot, pageContext } from '../given/a_layout_document';
import { flowNodeId } from '../index';
import { apply, codesOf, elementIds } from './given/edits';

type Document = ReturnType<typeof createLayoutDocument>;
const side = (model: Document) => model.screenTemplates[0].content!.side;
const root = (model: Document) => (model.screenTemplates[0].slots[0].arrangement as unknown as { root: { children: { children?: unknown[] }[] } }).root;

describe('when removing a node', () => {
    const document = createLayoutDocument();

    it('should remove an element from a list', () => {
        const outcome = apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'element:i' }, pageContext());
        outcome.applied.should.be.true;
        elementIds(side(outcome.model)).should.deep.equal(['stack']);
    });

    it('should remove an element and what is inside it', () => {
        const outcome = apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'element:stack' }, pageContext());
        elementIds(side(outcome.model)).should.deep.equal(['i']);
    });

    it('should remove the flow leaf along with the element it holds', () => {
        const outcome = apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'element:b' }, pageContext());
        elementIds(root(outcome.model).children[0].children!).should.deep.equal(['a']);
    });

    it('should remove a flow container with everything in it', () => {
        const outcome = apply(document, { kind: SceneEditKind.RemoveNode, nodeId: flowNodeId(mainSlot, 'root', [0]) }, pageContext());
        root(outcome.model).children.should.have.length(1);
    });

    it('should remove a freeform element from every size-class variant', () => {
        const outcome = apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'element:freeStack' }, pageContext());
        outcome.applied.should.be.true;
        const variants = (outcome.model.screenTemplates[0].slots[1].arrangement as unknown as { variants: { placements: unknown[] }[] }).variants;
        variants.map(variant => variant.placements.length).should.deep.equal([0, 0]);
    });

    it('should leave saved configuration alone so it reports instead of vanishing', () => {
        const configured = structuredClone(document);
        configured.instanceContributions.push({ instance: 'screen:Home', component: 'i', path: 'title', value: 'kept' });
        apply(configured, { kind: SceneEditKind.RemoveNode, nodeId: 'element:i' }, pageContext()).model.instanceContributions.should.have.length(1);
    });

    it('should refuse to remove the root of a flow', () => {
        codesOf(apply(document, { kind: SceneEditKind.RemoveNode, nodeId: flowNodeId(mainSlot, 'root', []) }, pageContext())).should.deep.equal([DiagnosticCode.NodeNotRemovable]);
    });

    it('should refuse to remove a slot', () => {
        codesOf(apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'screenTemplate:Page#slot:side' }, pageContext())).should.deep.equal([DiagnosticCode.NodeNotRemovable]);
    });

    it('should refuse to remove the one element a control requires', () => {
        const control = structuredClone(document);
        const content = { id: 'inside', properties: {}, componentName: 'test:table', slots: {} };
        control.screenTemplates[0].content!.side.push({ id: 'wrapper', properties: {}, content } as never);
        codesOf(apply(control, { kind: SceneEditKind.RemoveNode, nodeId: 'element:inside' }, pageContext())).should.deep.equal([DiagnosticCode.NodeNotRemovable]);
    });

    it('should refuse an inherited node', () => {
        codesOf(apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'element:i' }, homeContext())).should.deep.equal([DiagnosticCode.NodeNotEditable]);
    });

    it('should refuse a node that does not exist', () => {
        codesOf(apply(document, { kind: SceneEditKind.RemoveNode, nodeId: 'element:nope' }, pageContext())).should.deep.equal([DiagnosticCode.UnknownNode]);
    });
});
