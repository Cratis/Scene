// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, ExternalComponent, FlowContainerKind, SceneEditKind } from '@cratis/scene.model';
import { canvasSlot, createLayoutDocument, homeContext, mainSlot, pageContext, sideSlot, stackPanel, table } from '../given/a_layout_document';
import { component } from '../given/a_scene_document';
import { flowNodeId, freeformNodeId, slotNodeId } from '../index';
import { apply, codesOf, elementIds } from './given/edits';

describe('when inserting a node', () => {
    const document = createLayoutDocument();
    const side = (model: typeof document) => model.screenTemplates[0].content!.side;

    it('should append an element to a slot\'s content', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, element: table('new') }, pageContext());
        outcome.applied.should.be.true;
        elementIds(side(outcome.model)).should.deep.equal(['stack', 'i', 'new']);
    });

    it('should insert at a position', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, index: 0, element: table('new') }, pageContext());
        elementIds(side(outcome.model)).should.deep.equal(['new', 'stack', 'i']);
    });

    it('should create the content list of a slot that has none yet', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: slotNodeId('screenTemplate:Page', 'main'), element: table('new') }, pageContext());
        outcome.applied.should.be.true;
        elementIds(outcome.model.screenTemplates[0].content!.main).should.deep.equal(['new']);
    });

    it('should fill a slot a screen gets from its template', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: 'screen:Home#slot:main', element: table('new') }, homeContext());
        outcome.applied.should.be.true;
        elementIds(outcome.model.screens[0].slotContent.main).should.deep.equal(['new']);
    });

    it('should wrap an element in a leaf when inserting into a flow container', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: flowNodeId(mainSlot, 'root', [0]), index: 1, element: table('new') }, pageContext());
        outcome.applied.should.be.true;
        const row = (outcome.model.screenTemplates[0].slots[0].arrangement as unknown as { root: { children: { children: unknown[] }[] } }).root.children[0];
        elementIds(row.children).should.deep.equal(['a', 'new', 'b']);
    });

    it('should insert a flow node into a flow container', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: flowNodeId(mainSlot, 'root', []), flowNode: { kind: FlowContainerKind.Row, gap: 0, children: [] } as never }, pageContext());
        outcome.applied.should.be.true;
        (outcome.model.screenTemplates[0].slots[0].arrangement as unknown as { root: { children: unknown[] } }).root.children.should.have.length(3);
    });

    it('should insert into a panel\'s children', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: 'element:stack', index: 1, element: table('new') }, pageContext());
        elementIds((side(outcome.model)[0] as unknown as { children: unknown[] }).children).should.deep.equal(['g', 'new', 'h']);
    });

    it('should insert into a named slot of a component', () => {
        const host = structuredClone(document);
        host.screenTemplates[0].content!.side.push(component('host', 'test:table'));
        const outcome = apply(host, { kind: SceneEditKind.InsertNode, target: 'element:host', slot: 'content', element: table('new') }, pageContext());
        elementIds((side(outcome.model)[2] as ExternalComponent).slots.content).should.deep.equal(['new']);
    });

    it('should add an element to every size-class copy of a freeform element\'s panel', () => {
        const outcome = apply(document, { kind: SceneEditKind.InsertNode, target: 'element:freeStack', element: table('new') }, pageContext());
        outcome.applied.should.be.true;
        const variants = (outcome.model.screenTemplates[0].slots[1].arrangement as unknown as { variants: { placements: { element: { children: unknown[] } }[] }[] }).variants;
        variants.map(variant => elementIds(variant.placements[0].element.children)).should.deep.equal([['f', 'new'], ['f', 'new']]);
    });

    it('should refuse an element id that is already used', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, element: table('g') }, pageContext())).should.deep.equal([DiagnosticCode.ElementIdInUse]);
    });

    it('should refuse an id reused inside what is inserted', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, element: stackPanel('p', [table('x'), table('x')]) }, pageContext())).should.deep.equal([DiagnosticCode.ElementIdInUse]);
    });

    it('should refuse a position that does not exist', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, index: 9, element: table('new') }, pageContext())).should.deep.equal([DiagnosticCode.IndexOutOfRange]);
    });

    it('should refuse a target that does not exist', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: 'element:nope', element: table('new') }, pageContext())).should.deep.equal([DiagnosticCode.UnknownNode]);
    });

    it('should refuse an inherited target', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, element: table('new') }, homeContext())).should.deep.equal([DiagnosticCode.NodeNotEditable]);
    });

    it('should refuse a layout slot, which holds no content', () => {
        const context = { ...pageContext(), scope: { kind: 'layout' as const, name: 'Shell' } };
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: 'layout:Shell#slot:content', element: table('new') }, context)).should.deep.equal([DiagnosticCode.TargetDoesNotAcceptChildren]);
    });

    it('should refuse a flow leaf, which holds one element', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: flowNodeId(mainSlot, 'root', [1]), element: table('new') }, pageContext())).should.deep.equal([DiagnosticCode.TargetDoesNotAcceptChildren]);
    });

    it('should refuse a freeform arrangement, which places through placements', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: freeformNodeId(canvasSlot), element: table('new') }, pageContext())).should.deep.equal([DiagnosticCode.TargetDoesNotAcceptChildren]);
    });

    it('should refuse a flow node outside a flow container', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot, flowNode: { gap: 0 } as never }, pageContext())).should.deep.equal([DiagnosticCode.InvalidEdit]);
    });

    it('should refuse an insert that names neither an element nor a flow node', () => {
        codesOf(apply(document, { kind: SceneEditKind.InsertNode, target: sideSlot }, pageContext())).should.deep.equal([DiagnosticCode.InvalidEdit]);
    });

    it('should ask which slot of a component to insert into', () => {
        const host = structuredClone(document);
        host.screenTemplates[0].content!.side.push(component('host', 'test:table'));
        codesOf(apply(host, { kind: SceneEditKind.InsertNode, target: 'element:host', element: table('new') }, pageContext())).should.deep.equal([DiagnosticCode.UnknownSlot]);
    });
});
