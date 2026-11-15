// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScreenEditorPrimeReactProvider } from '../../Host/ScreenEditorPrimeReactProvider';
import { PlayScreenView } from '../../Play/PlayScreen';
import { openSession } from '../../Session/EditSession';
import { SessionCell } from '../../Session/SessionCell';
import { sceneScreenDraftSession } from '../sceneScreenDraftSession';
import { answer, context, original, runtime } from './given/a_layout_draft';

// No query-result scope or registry replacement: the actual registered controls must render the proposal.
describe('when previewing a layout-only draft through the existing Scene renderer', () => {
    let cell: SessionCell;
    let html: string;
    let changes: number;

    beforeEach(() => {
        changes = 0;
        cell = new SessionCell(openSession(original), () => { changes++; });
        const controller = sceneScreenDraftSession(cell, runtime, context);
        const draft = controller.prepareSceneScreenDraft(answer, []);
        if (!draft.prepared) throw new Error(draft.problem);
                html = renderToStaticMarkup(createElement(ScreenEditorPrimeReactProvider, null, createElement(PlayScreenView, { document: draft.prepared.document, runtime, resolveBinding: () => undefined })));
    });

    it('should render the title and label', () => { html.should.include('Customer details'); html.should.include('Name'); });
    it('should render the ordinary input with its placeholder', () => { html.should.include('<input'); html.should.include('Customer name'); });
    it('should render a non-submit button', () => { html.should.include('type="button"'); html.should.include('Save'); html.should.not.include('<form'); });
    it('should render the nested row and stack', () => { html.should.include('draft-row'); html.should.include('draft-stack'); });
    it('should not edit or save the live session', () => { (cell.current.document === original).should.be.true; changes.should.equal(0); cell.current.isDirty.should.be.false; cell.current.undoable.should.have.lengthOf(0); });
});
