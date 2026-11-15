// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { elementNodeId } from '@cratis/scene.engine';
import { SceneEditKind, type SceneDocument } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { readSceneDocument } from '../../Document/readSceneDocument';
import { authoredRoot, createScreenDocument, createTemplateDocument } from '../../Document/studioScreen';
import { withScreenAsPrimary } from '../../Document/screenSelection';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { applyAllToSession, markSaved, openSession, redo, undo } from '../../Session/EditSession';
import { SessionCell } from '../../Session/SessionCell';
import { sceneScreenDraftSession } from '../sceneScreenDraftSession';
import { answer, context, edits, runtime } from './given/a_layout_draft';

// Persistence here is the existing editor document serialization boundary, not a simulated backend save.
describe('when a layout draft is added to a screen with existing query content', () => {
    let original: SceneDocument;
    let cell: SessionCell;
    let controller: ReturnType<typeof sceneScreenDraftSession>;
    let before: string;

    beforeEach(() => {
        const bound = { ...createExternalComponent('existing-query', 'Existing customers', 'Cratis.Components:dataTable'), properties: { query: { queryId: 'old-customers', query: 'OldCustomers', arguments: [], results: [] } } };
        const root = { ...createPanel(LayoutItem.Stack, 'screen-root', 'Screen'), children: [bound] };
        const screen = createScreenDocument(root);
        original = {
            ...screen,
            screens: [...screen.screens, { ...screen.screens[0], name: 'Other', slotContent: { content: [createPanel(LayoutItem.Stack, 'other-root', 'Other')] } }],
            screenTemplates: createTemplateDocument('Existing template', createPanel(LayoutItem.Row, 'template-root', 'Template')).screenTemplates,
        };
        before = JSON.stringify(original);
        cell = new SessionCell(openSession(original), () => {});
        controller = sceneScreenDraftSession(cell, runtime, context);
    });

    it('should not reject the old binding when preparing unrelated layout additions', () => {
        const result = controller.prepareSceneScreenDraft(answer, []);
        if (!result.prepared) throw new Error(result.problem);
        JSON.stringify(original).should.equal(before);
        JSON.stringify(authoredRoot(result.prepared.document)?.children[0]).should.equal(JSON.stringify(authoredRoot(original)?.children[0]));
    });
    it('should preserve old nodes screens and templates through Apply ordinary serialization and reopen', () => {
        const draft = controller.prepareSceneScreenDraft(answer, []).prepared!;
        controller.applySceneScreenDraft(draft).applied.should.be.true;
        cell.current.undoable.should.have.lengthOf(1);
        const saved = JSON.stringify(withScreenAsPrimary(cell.current.document, 'Screen'));
        const reopened = readSceneDocument(saved);
        if (!reopened.readable) throw new Error(reopened.problem);
        JSON.stringify(authoredRoot(reopened.document)?.children[0]).should.equal(JSON.stringify(authoredRoot(original)?.children[0]));
        JSON.stringify(reopened.document.screens[1]).should.equal(JSON.stringify(original.screens[1]));
        JSON.stringify(reopened.document.screenTemplates).should.equal(JSON.stringify(original.screenTemplates));
        saved.should.include('Customer name');
        cell.commit(markSaved);
        cell.current.isDirty.should.be.false;
    });
    it('should undo and redo the layout without disturbing existing content', () => {
        const draft = controller.prepareSceneScreenDraft(answer, []).prepared!;
        controller.applySceneScreenDraft(draft).applied.should.be.true;
        const applied = JSON.stringify(cell.current.document);
        cell.commit(undo);
        JSON.stringify(cell.current.document).should.equal(before);
        cell.commit(redo);
        JSON.stringify(cell.current.document).should.equal(applied);
    });
    it('should refuse a late query property with no partial change to history dirty state or saved content', () => {
        const invalid = JSON.stringify({ reply: '', edits: [...edits, { kind: 'setProperty', nodeId: elementNodeId('draft-input'), path: 'query', value: { queryId: 'old-customers', query: 'OldCustomers', arguments: [], results: [] } }] });
        const draft = controller.prepareSceneScreenDraft(answer, []).prepared!;
        controller.applySceneScreenDraft({ ...draft, answer: invalid }).applied.should.be.false;
        JSON.stringify(cell.current.document).should.equal(before);
        (cell.current.savedDocument === original).should.be.true;
        cell.current.isDirty.should.be.false;
        cell.current.undoable.should.have.lengthOf(0);
        cell.current.redoable.should.have.lengthOf(0);
    });
    it('should retain existing unsaved changes when undoing the single draft step', () => {
        cell.commit(session => applyAllToSession(session, [{ kind: SceneEditKind.InsertNode, target: elementNodeId('screen-root'), element: createPanel(LayoutItem.Row, 'manual-row', 'Manual') }], context, 'Manual edit'));
        const dirtyBefore = cell.current.document;
        const draft = controller.prepareSceneScreenDraft(answer, []).prepared!;
        controller.applySceneScreenDraft(draft).applied.should.be.true;
        cell.current.undoable.should.have.lengthOf(2);
        cell.commit(undo);
        (cell.current.document === dirtyBefore).should.be.true;
        cell.current.isDirty.should.be.true;
    });
    it('should preserve document and history when the review is discarded without Apply', () => {
        controller.prepareSceneScreenDraft(answer, []);
        JSON.stringify(cell.current.document).should.equal(before);
        cell.current.undoable.should.have.lengthOf(0);
        cell.current.isDirty.should.be.false;
    });
});
