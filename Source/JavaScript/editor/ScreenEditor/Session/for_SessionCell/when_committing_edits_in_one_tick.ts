// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, type SceneDocument } from '@cratis/scene.model';
import { createDescriptorCatalog, type EditingContext } from '@cratis/scene.engine';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, screenName } from '../../Document/studioScreen';
import { toInsertNodeEdit, toRemoveNodeEdit } from '../../Selection/toSceneEdits';
import { applyToSession, openSession, type ScreenEditSession } from '../EditSession';
import { SessionCell } from '../SessionCell';

const context: EditingContext = { catalog: createDescriptorCatalog([]), scope: { kind: EditingScopeKind.Screen, name: screenName } };
const document = (): SceneDocument => createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'));
const idsOf = (session: ScreenEditSession) => (session.document.screens[0].slotContent.content[0] as unknown as { children: { id: string }[] }).children.map(child => child.id);
const insert = (id: string) => toInsertNodeEdit('root', 0, createExternalComponent(id, id, 'button'));

describe('when two edits are committed before the screen renders again', () => {
    const published: ScreenEditSession[] = [];
    const cell = new SessionCell(openSession(document()), session => published.push(session));

    cell.commit(session => applyToSession(session, insert('a'), context, 'Add'));
    cell.commit(session => applyToSession(session, insert('b'), context, 'Add'));

    it('should keep both', () => idsOf(cell.current).should.have.members(['a', 'b']));
    it('should publish each result', () => published.length.should.equal(2));
    it('should give the second edit the first one as its history', () => cell.current.undoable.length.should.equal(2));
});

describe('when an edit is refused', () => {
    const cell = new SessionCell(openSession(document()), () => undefined);
    const before = cell.current;
    const after = cell.commit(session => applyToSession(session, toRemoveNodeEdit('missing'), context, 'Remove'));

    it('should leave the document alone', () => (after.document === before.document).should.be.true);
    it('should add no history', () => after.undoable.length.should.equal(0));
});
