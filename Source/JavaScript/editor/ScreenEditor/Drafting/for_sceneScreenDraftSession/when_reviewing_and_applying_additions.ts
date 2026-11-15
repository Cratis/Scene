// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.react';
import { elementNodeId, type EditingContext } from '@cratis/scene.engine';
import { SceneEditKind, type SceneDocument } from '@cratis/scene.model';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, editingScope } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { applyAllToSession, openSession, redo, undo } from '../../Session/EditSession';
import { SessionCell } from '../../Session/SessionCell';
import type { PreparedSceneScreenDraft } from '../SceneScreenDraft';
import { sceneScreenDraftSession } from '../sceneScreenDraftSession';

const runtime = createScreenEditorRuntime([corePackage], { name: 'test', packages: ['core'], targetPlatform: 'web' });
const context: EditingContext = { catalog: runtime.catalog, scope: editingScope(), queryCandidates: [] };
const add = (id: string) => ({ kind: SceneEditKind.InsertNode as const, target: elementNodeId('screen-root'), element: createPanel(LayoutItem.Row, id, 'Row') });
const answer = JSON.stringify({ reply: 'Add a row', edits: [add('draft-row'), { kind: SceneEditKind.InsertNode as const, target: elementNodeId('draft-row'), element: createPanel(LayoutItem.Stack, 'draft-stack', 'Stack') }] });

describe('when reviewing and applying additions in the live edit session', () => {
    let original: SceneDocument;
    let cell: SessionCell;
    let changes: number;
    let controller: ReturnType<typeof sceneScreenDraftSession>;
    let draft: PreparedSceneScreenDraft;

    beforeEach(() => {
        original = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen'));
        changes = 0;
        cell = new SessionCell(openSession(original), () => { changes++; });
        controller = sceneScreenDraftSession(cell, runtime, context);
        draft = controller.prepareSceneScreenDraft(answer, []).prepared!;
    });

    it('should prepare a separate preview document', () => (draft.document !== original).should.be.true);
    it('should leave the live document untouched while reviewing', () => (cell.current.document === original).should.be.true);
    it('should not publish an edit during generation or preview', () => changes.should.equal(0));
    it('should keep preview clean with no history', () => { cell.current.isDirty.should.be.false; cell.current.undoable.should.have.lengthOf(0); });
    it('should apply the entire batch as one dirty undo step', () => {
        controller.applySceneScreenDraft(draft).applied.should.be.true;
        cell.current.undoable.should.have.lengthOf(1);
        cell.current.isDirty.should.be.true;
        changes.should.equal(1);
    });
    it('should undo to the exact saved document', () => {
        controller.applySceneScreenDraft(draft);
        cell.commit(undo);
        (cell.current.document === original).should.be.true;
        cell.current.isDirty.should.be.false;
    });
    it('should redo every addition together', () => {
        controller.applySceneScreenDraft(draft);
        const applied = cell.current.document;
        cell.commit(undo);
        cell.commit(redo);
        (cell.current.document === applied).should.be.true;
    });
    it('should reject a document changed in the same tick before rerender', () => {
        cell.commit(session => applyAllToSession(session, [add('manual-row')], context, 'Manual edit'));
        controller.isSceneScreenDraftCurrent(draft).should.be.false;
        controller.applySceneScreenDraft(draft).applied.should.be.false;
        cell.current.undoable.should.have.lengthOf(1);
        changes.should.equal(1);
    });
    it('should reject a replaced editing context', () => {
        const changed = sceneScreenDraftSession(cell, runtime, { ...context, queryCandidates: [] });
        changed.isSceneScreenDraftCurrent(draft).should.be.false;
        changed.applySceneScreenDraft(draft).applied.should.be.false;
    });
    it('should reject a replaced runtime even when the base is unchanged', () => {
        const changed = sceneScreenDraftSession(cell, { ...runtime }, context);
        changed.isSceneScreenDraftCurrent(draft).should.be.false;
        changed.applySceneScreenDraft(draft).applied.should.be.false;
    });
    it('should rebuild from the answer instead of trusting mutable preview edits', () => {
        controller.applySceneScreenDraft({ ...draft, edits: [add('forged-row')], document: original }).applied.should.be.true;
        JSON.stringify(cell.current.document).should.include('draft-stack');
        JSON.stringify(cell.current.document).should.not.include('forged-row');
    });
    it('should revalidate the entire answer and reject a late invalid edit atomically', () => {
        const invalid = { ...draft, answer: JSON.stringify({ reply: 'Invalid', edits: [add('another-row'), { kind: SceneEditKind.RemoveNode, nodeId: elementNodeId('screen-root') }] }) };
        controller.applySceneScreenDraft(invalid).applied.should.be.false;
        (cell.current.document === original).should.be.true;
        cell.current.undoable.should.have.lengthOf(0);
        cell.current.isDirty.should.be.false;
        changes.should.equal(0);
    });
    it('should refuse applying the same proposal twice', () => {
        controller.applySceneScreenDraft(draft).applied.should.be.true;
        controller.applySceneScreenDraft(draft).applied.should.be.false;
        changes.should.equal(1);
    });
});
