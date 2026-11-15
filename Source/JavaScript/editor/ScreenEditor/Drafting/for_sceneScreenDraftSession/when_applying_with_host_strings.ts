// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.react';
import { elementNodeId, type EditingContext } from '@cratis/scene.engine';
import { SceneEditKind } from '@cratis/scene.model';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, editingScope } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { openSession } from '../../Session/EditSession';
import { SessionCell } from '../../Session/SessionCell';
import type { PreparedSceneScreenDraft } from '../SceneScreenDraft';
import { defaultSceneScreenDraftStrings } from '../defaultSceneScreenDraftStrings';
import { sceneScreenDraftSession } from '../sceneScreenDraftSession';

const runtime = createScreenEditorRuntime([corePackage], { name: 'test', packages: ['core'], targetPlatform: 'web' });
const context: EditingContext = { catalog: runtime.catalog, scope: editingScope(), queryCandidates: [] };
const add = (id: string) => ({ kind: SceneEditKind.InsertNode as const, target: elementNodeId('screen-root'), element: createPanel(LayoutItem.Row, id, 'Row') });
const answer = JSON.stringify({ reply: 'Add a row', edits: [add('draft-row')] });
const hostStrings = { ...defaultSceneScreenDraftStrings, undoLabel: 'Bruk KI-utkast', changed: 'Skjermen er endret', applyFailed: 'Kunne ikke bruke utkastet' };

describe('when applying a draft with the host strings', () => {
    let cell: SessionCell;
    let controller: ReturnType<typeof sceneScreenDraftSession>;
    let draft: PreparedSceneScreenDraft;

    beforeEach(() => {
        cell = new SessionCell(openSession(createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen'))), () => { });
        controller = sceneScreenDraftSession(cell, runtime, context, hostStrings);
        draft = controller.prepareSceneScreenDraft(answer, []).prepared!;
    });

    it('should record the host undo label on the undo step', () => {
        controller.applySceneScreenDraft(draft).applied.should.be.true;
        cell.current.undoable[cell.current.undoable.length - 1].label.should.equal('Bruk KI-utkast');
    });
    it('should return the host text for a draft of a screen that changed', () => {
        controller.applySceneScreenDraft(draft);
        const again = controller.applySceneScreenDraft(draft);
        again.applied.should.be.false;
        again.problem!.should.equal('Skjermen er endret');
    });
});
