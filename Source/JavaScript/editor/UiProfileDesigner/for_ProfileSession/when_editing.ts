// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    canRedoProfile,
    canUndoProfile,
    changeProfile,
    markProfileSaved,
    maximumProfileHistory,
    nextRedoLabel,
    nextUndoLabel,
    openProfileSession,
    redoProfile,
    undoProfile,
} from '../Session/ProfileSession';

const first = { name: 'first' };
const second = { name: 'second' };
const third = { name: 'third' };

describe('when an edit is applied', () => {
    const session = changeProfile(openProfileSession(first), second, 'Rename');

    it('should hold the edited document', () => session.document.should.equal(second));
    it('should be undoable', () => canUndoProfile(session).should.be.true);
    it('should not be redoable', () => canRedoProfile(session).should.be.false);
    it('should be unsaved', () => session.isDirty.should.be.true);
    it('should name the edit to undo', () => nextUndoLabel(session)!.should.equal('Rename'));
});

describe('when an edit leaves the document as it was', () => {
    const opened = openProfileSession(first);
    const session = changeProfile(opened, first, 'Nothing');

    it('should record no step', () => session.should.equal(opened));
});

describe('when an edit is undone', () => {
    const session = undoProfile(changeProfile(openProfileSession(first), second, 'Rename'));

    it('should bring the previous document back', () => session.document.should.equal(first));
    it('should be redoable', () => canRedoProfile(session).should.be.true);
    it('should be back to what was saved', () => session.isDirty.should.be.false);
    it('should name the edit to redo', () => nextRedoLabel(session)!.should.equal('Rename'));
});

describe('when an undone edit is redone', () => {
    const session = redoProfile(undoProfile(changeProfile(openProfileSession(first), second, 'Rename')));

    it('should bring the edit back', () => session.document.should.equal(second));
    it('should be unsaved again', () => session.isDirty.should.be.true);
});

describe('when a new edit follows an undo', () => {
    const session = changeProfile(undoProfile(changeProfile(openProfileSession(first), second, 'Rename')), third, 'Other');

    it('should drop what could have been redone', () => canRedoProfile(session).should.be.false);
    it('should hold only the new edit', () => session.document.should.equal(third));
});

describe('when there is nothing to undo or redo', () => {
    const opened = openProfileSession(first);

    it('should leave the session as it is when undone', () => undoProfile(opened).should.equal(opened));
    it('should leave the session as it is when redone', () => redoProfile(opened).should.equal(opened));
});

describe('when the document is marked saved', () => {
    const session = markProfileSaved(changeProfile(openProfileSession(first), second, 'Rename'));

    it('should no longer be dirty', () => session.isDirty.should.be.false);
    it('should keep the history', () => canUndoProfile(session).should.be.true);
    it('should be dirty when undone past what was saved', () => undoProfile(session).isDirty.should.be.true);
});

describe('when the document is marked saved while a newer edit was made', () => {
    const edited = changeProfile(changeProfile(openProfileSession(first), second, 'Rename'), third, 'Rename again');
    const session = markProfileSaved(edited, second);

    it('should stay dirty because what is stored is not what the author has', () => session.isDirty.should.be.true);
});

describe('when more edits are made than the history keeps', () => {
    let session = openProfileSession<{ value: number }>({ value: 0 });
    for (let index = 1; index <= maximumProfileHistory + 10; index++) session = changeProfile(session, { value: index }, `Edit ${index}`);

    it('should keep only the most recent steps', () => session.undoable.length.should.equal(maximumProfileHistory));
});

describe('when documents are compared by value', () => {
    const byName = (left: { name: string }, right: { name: string }) => left.name === right.name;
    const edited = changeProfile(openProfileSession(first, byName), { name: 'second' }, 'Rename');
    const undone = undoProfile(edited);
    const sameAgain = changeProfile(edited, { name: 'second' }, 'Rename again');

    it('should be clean when undone to an equal document', () => undone.isDirty.should.be.false);
    it('should record no step for an equal document', () => sameAgain.should.equal(edited));
    it('should be clean when changed back to an equal document by hand', () => changeProfile(edited, { name: 'first' }, 'Back').isDirty.should.be.false);
});

describe('when the same edit is made again within the merge window', () => {
    const typed = changeProfile(changeProfile(changeProfile(openProfileSession(first), second, 'Rename', 1000), third, 'Rename', 1300), { name: 'fourth' }, 'Rename', 1600);

    it('should be one step to undo', () => typed.undoable.length.should.equal(1));
    it('should take the whole run back at once', () => undoProfile(typed).document.should.equal(first));
    it('should keep the latest document', () => typed.document.name.should.equal('fourth'));
});

describe('when the same edit is made again after a pause', () => {
    const typed = changeProfile(changeProfile(openProfileSession(first), second, 'Rename', 1000), third, 'Rename', 3000);

    it('should be two steps to undo', () => typed.undoable.length.should.equal(2));
});

describe('when a different edit follows quickly', () => {
    const edited = changeProfile(changeProfile(openProfileSession(first), second, 'Rename', 1000), third, 'Accent', 1100);

    it('should be two steps to undo', () => edited.undoable.length.should.equal(2));
    it('should name the latest edit to undo', () => nextUndoLabel(edited)!.should.equal('Accent'));
});

describe('when an edit follows an undo of the same kind', () => {
    const undone = undoProfile(changeProfile(openProfileSession(first), second, 'Rename', 1000));
    const again = changeProfile(undone, third, 'Rename', 1100);

    it('should be a new step, not merged into what was undone', () => again.undoable.length.should.equal(1));
    it('should not be redoable', () => canRedoProfile(again).should.be.false);
});
