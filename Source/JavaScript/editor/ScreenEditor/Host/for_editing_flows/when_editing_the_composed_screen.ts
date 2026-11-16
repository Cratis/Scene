// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneEditKind, type SceneElement } from '@cratis/scene.model';
import { elementNodeId } from '@cratis/scene.engine';
import { DropRegionKind } from '../../DropRegions/DropRegionKind';
import { Ownership } from '../../Structure/Ownership';
import { StructureEditRejection } from '../../Structure/StructureEditRejection';
import { validateStructureEdit } from '../../Structure/validateStructureEdit';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { authoredRoot } from '../../Document/studioScreen';
import { applyToSession, openSession, redo, undo } from '../../Session/EditSession';
import { toInsertNodeEdit, toMoveNodeEdit, toRemoveNodeEdit } from '../../Selection/toSceneEdits';
import { childrenOfElement } from '../../Selection/sceneTree';
import { composedScreen, describeComposition, screenContext, templateContext } from './given_a_composed_screen';

const idsUnder = (session: ReturnType<typeof openSession>, id: string) => {
    const root = authoredRoot(session.document)!;
    const find = (element: SceneElement): SceneElement | undefined => (element as { id: string }).id === id ? element : childrenOfElement(element).map(find).find(Boolean);
    return childrenOfElement(find(root)!).map(child => (child as { id: string }).id);
};

describe('when dropping a component into an empty container', () => {
    const context = screenContext();
    const session = applyToSession(openSession(composedScreen()), toInsertNodeEdit('row', 0, createExternalComponent('new', 'New', 'button')), context, 'Add');

    it('should put it inside that container', () => idsUnder(session, 'row').should.deep.equal(['new']));
    it('should be one undo step', () => idsUnder(undo(session), 'row').should.deep.equal([]));
    it('should come back on redo', () => idsUnder(redo(undo(session)), 'row').should.deep.equal(['new']));
});

describe('when the composed screen is asked for places to drop', () => {
    const { regions } = describeComposition(composedScreen(), screenContext());

    it('should offer the empty row as a target', () => regions.some(region => region.containerId === 'row' && region.isEmptyContainer && region.kind === DropRegionKind.Container).should.be.true);
    it('should offer a marker between the root\'s children', () => regions.some(region => region.containerId === 'screen-root' && region.kind === DropRegionKind.Between).should.be.true);
    it('should offer the canvas its body only, since placement there is by position', () =>
        regions.filter(region => region.containerId === 'canvas').map(region => region.kind).should.deep.equal([DropRegionKind.Container]));
    it('should offer nothing inside the template\'s content', () => regions.some(region => region.containerId === 'nav').should.be.false);
});

describe('when moving a component into a container', () => {
    const { composition, adapter } = describeComposition(composedScreen(), screenContext());
    const edit = { nodeId: 'button', targetParentId: 'row', index: 0 };

    it('should be allowed by the structure rules', () => (validateStructureEdit(composition.roots, edit, adapter) === undefined).should.be.true);

    const session = applyToSession(openSession(composedScreen()), toMoveNodeEdit(edit)!, screenContext(), 'Move');

    it('should take it out of where it was', () => idsUnder(session, 'screen-root').should.not.include('button'));
    it('should put it where it was dropped', () => idsUnder(session, 'row').should.deep.equal(['button']));
});

describe('when moving a container into itself', () => {
    const { composition, adapter } = describeComposition(composedScreen(), screenContext());

    it('should be refused before Scene is asked', () => validateStructureEdit(composition.roots, { nodeId: 'row', targetParentId: 'row', index: 0 }, adapter)!.should.equal(StructureEditRejection.WouldCreateCycle));
});

describe('when the screen is built from a template', () => {
    const { ownershipOf, adapter, composition } = describeComposition(composedScreen(), screenContext());

    it('should lock the template\'s own content', () => ownershipOf('nav').should.equal(Ownership.Inherited));
    it('should leave the screen\'s content editable', () => ownershipOf('button').should.equal(Ownership.Local));
    it('should refuse to move inherited content', () => validateStructureEdit(composition.roots, { nodeId: 'nav', targetParentId: 'row', index: 0 }, adapter)!.should.equal(StructureEditRejection.NodeLocked));
    it('should have Scene refuse the same edit', () => {
        const before = openSession(composedScreen());
        const refused = applyToSession(before, toRemoveNodeEdit('nav'), screenContext(), 'Remove');
        (refused.document === before.document && refused.diagnostics.length > 0).should.be.true;
    });
});

describe('when authoring the template itself', () => {
    const { ownershipOf } = describeComposition(composedScreen(), templateContext(), 'Shell');

    it('should make the template\'s content editable', () => ownershipOf('nav').should.equal(Ownership.Local));
    it('should let the author remove it', () => {
        const session = applyToSession(openSession(composedScreen()), toRemoveNodeEdit('nav'), templateContext(), 'Remove');
        (session.document !== composedScreen() && session.document.screenTemplates[0].content!.content.length === 0).should.be.true;
    });
});

describe('when Scene is asked for something it will not do', () => {
    it('should explain a missing target', () => {
        const refused = applyToSession(openSession(composedScreen()), { kind: SceneEditKind.MoveNode, nodeId: elementNodeId('button'), target: elementNodeId('missing'), index: 0 }, screenContext(), 'Move');
        refused.diagnostics.map(diagnostic => diagnostic.code).should.include(DiagnosticCode.UnknownNode);
    });
});
