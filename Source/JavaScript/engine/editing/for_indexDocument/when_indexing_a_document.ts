// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, LayoutType, SceneNodeKind } from '@cratis/scene.model';
import { elementNodeId, flowNodeId, indexDocument, placementNodeId } from '../index';
import { canvasSlot, createLayoutDocument, mainSlot, sideSlot, table } from '../given/a_layout_document';

describe('when indexing a document', () => {
    const index = indexDocument(createLayoutDocument());
    const kindOf = (id: string) => index.nodes.get(id)!.kind;

    it('should index the owners and their slots', () => {
        kindOf('layout:Shell').should.equal(SceneNodeKind.Layout);
        kindOf('screenTemplate:Page').should.equal(SceneNodeKind.ScreenTemplate);
        kindOf('screen:Home').should.equal(SceneNodeKind.Screen);
        kindOf(mainSlot).should.equal(SceneNodeKind.Slot);
    });

    it('should index slots a screen can fill through its template', () => {
        kindOf('screen:Home#slot:main').should.equal(SceneNodeKind.Slot);
        kindOf('screen:Home#slot:side').should.equal(SceneNodeKind.Slot);
    });

    it('should index flow nodes by structural address', () => {
        index.nodes.get(flowNodeId(mainSlot, 'root', []))!.typeId.should.equal(LayoutType.FlowColumn);
        index.nodes.get(flowNodeId(mainSlot, 'root', [0]))!.typeId.should.equal(LayoutType.FlowRow);
        index.nodes.get(flowNodeId(mainSlot, 'root', [0, 1]))!.typeId.should.equal(LayoutType.FlowLeaf);
    });

    it('should find elements wherever they are kept', () => {
        for (const id of ['a', 'b', 'c', 'f', 'g', 'h', 'i', 'j', 'stack', 'freeStack']) kindOf(elementNodeId(id)).should.equal(SceneNodeKind.Element);
    });

    it('should say which flow leaf holds an element', () => {
        index.nodes.get(elementNodeId('a'))!.leafId!.should.equal(flowNodeId(mainSlot, 'root', [0, 0]));
    });

    it('should know a freeform element once and place it in every variant', () => {
        index.nodes.get(elementNodeId('freeStack'))!.placementIds!.should.deep.equal([
            placementNodeId(canvasSlot, 0, 'freeStack'), placementNodeId(canvasSlot, 1, 'freeStack'),
        ]);
    });

    it('should know the type of a panel from its shape', () => {
        index.nodes.get(elementNodeId('stack'))!.typeId.should.equal(LayoutType.StackPanel);
    });

    it('should record where a child sits in its list', () => {
        index.nodes.get(elementNodeId('h'))!.list!.index.should.equal(1);
        index.nodes.get(elementNodeId('h'))!.parentId!.should.equal(elementNodeId('stack'));
        index.nodes.get(elementNodeId('stack'))!.parentId!.should.equal(sideSlot);
    });

    it('should report an element id used twice and keep the first', () => {
        const document = createLayoutDocument();
        document.screens[0].slotContent.side.push(table('g'));
        const duplicated = indexDocument(document);
        duplicated.diagnostics.map(diagnostic => diagnostic.code).should.deep.equal([DiagnosticCode.DuplicateElementId]);
        duplicated.nodes.get(elementNodeId('g'))!.owner.should.equal('Page');
    });
});
