// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, SceneEditKind, type SceneDocument } from '@cratis/scene.model';
import { createDescriptorCatalog, elementNodeId, type EditingContext } from '@cratis/scene.engine';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, screenName } from '../../Document/studioScreen';
import { toInsertNodeEdit } from '../../Selection/toSceneEdits';
import { applyToSession, canRedo, canUndo, markSaved, openSession, redo, undo } from '../EditSession';

const context: EditingContext = { catalog: createDescriptorCatalog([]), scope: { kind: EditingScopeKind.Screen, name: screenName } };
const document = (): SceneDocument => createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'));
const insert = (id: string) => toInsertNodeEdit('root', 0, createExternalComponent(id, id, 'button'));
const idsOf = (session: ReturnType<typeof openSession>) => (session.document.screens[0].slotContent.content[0] as unknown as { children: { id: string }[] }).children.map(child => child.id);

describe('when an edit is applied', () => {
    const session = applyToSession(openSession(document()), insert('a'), context, 'Add');

    it('should put the element in the document', () => idsOf(session).should.deep.equal(['a']));
    it('should be undoable', () => canUndo(session).should.be.true);
    it('should not be redoable', () => canRedo(session).should.be.false);
    it('should be unsaved', () => session.isDirty.should.be.true);
});

describe('when an edit is undone', () => {
    const session = undo(applyToSession(openSession(document()), insert('a'), context, 'Add'));

    it('should take the element out again', () => idsOf(session).should.deep.equal([]));
    it('should be redoable', () => canRedo(session).should.be.true);
    it('should be back to what was saved', () => session.isDirty.should.be.false);
});

describe('when an undone edit is redone', () => {
    const session = redo(undo(applyToSession(openSession(document()), insert('a'), context, 'Add')));

    it('should bring the element back', () => idsOf(session).should.deep.equal(['a']));
});

describe('when a new edit follows an undo', () => {
    const session = applyToSession(undo(applyToSession(openSession(document()), insert('a'), context, 'Add')), insert('b'), context, 'Add');

    it('should drop what could have been redone', () => canRedo(session).should.be.false);
    it('should hold only the new edit', () => idsOf(session).should.deep.equal(['b']));
});

describe('when Scene refuses an edit', () => {
    const before = openSession(document());
    const refused = applyToSession(before, { kind: SceneEditKind.RemoveNode, nodeId: elementNodeId('missing') }, context, 'Remove');

    it('should leave the document alone', () => (refused.document === before.document).should.be.true);
    it('should add no history', () => canUndo(refused).should.be.false);
    it('should say why', () => (refused.diagnostics.length > 0).should.be.true);
});

describe('when the session is marked saved', () => {
    const saved = markSaved(applyToSession(openSession(document()), insert('a'), context, 'Add'));

    it('should no longer be dirty', () => saved.isDirty.should.be.false);
    it('should be dirty again after undoing past the saved point', () => undo(saved).isDirty.should.be.true);
});
