// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { currentRevisionOf, foldDesignSession } from '@cratis/scene.design';
import { aSession, revision } from '../../given/aSession';
import { started } from '../../given/aStartedDesign';
import { countingDesignIds } from '../../Host/randomDesignIds';
import { describeOperation, historyOf, revertEvents, revertTurnEvents, revertibleTurns } from '../revisionHistory';

describe('when reading the history of a screen', () => {
    const session = aSession([
        revision('r1', 'Home', 'one', { prompt: 'Make a home screen' }),
        revision('r2', 'Home', 'two', { operations: [{ op: 'insert', screen: 'Home', outlet: 'body', component: 'core:table' }], turnId: 't2' }),
        revision('r3', 'Other', 'o', { turnId: 't2' }),
        { type: 'ScreenReverted', revisionId: 'r4', screen: 'Home', toRevisionId: 'r1', author: 'ada' },
    ]);
    const history = historyOf(session, 'Home');

    it('should list the newest first', () => history.map(entry => entry.revision.id).should.deep.equal(['r4', 'r2', 'r1']));
    it('should mark the revision the screen is at', () => history.map(entry => entry.current).should.deep.equal([true, false, false]));
    it('should say a revert is a restore', () => history[0]!.kind.should.equal('restored'));
    it('should say what a prompt asked', () => history[2]!.summary.should.equal('Make a home screen'));
    it('should say what operations did when there was no prompt', () => history[1]!.summary.should.equal('Added core:table to body'));
    it('should say which other screens the same turn changed', () => history[1]!.alsoChanged.should.deep.equal(['Other']));
    it('should call the first revision created', () => history[2]!.kind.should.equal('created'));
});

describe('when going back to an earlier revision', () => {
    const session = aSession([revision('r1', 'Home', 'one'), revision('r2', 'Home', 'two')]);

    describe('and the revision is earlier', () => {
        const events = revertEvents(session, 'Home', 'r1', 'ada', countingDesignIds());
        const after = foldDesignSession([started(), revision('r1', 'Home', 'one'), revision('r2', 'Home', 'two'), ...events])!;

        it('should record one event that restores it', () => events.should.deep.equal([{ type: 'ScreenReverted', revisionId: 'revision-1', screen: 'Home', toRevisionId: 'r1', author: 'ada' }]));
        it('should make a new revision rather than delete one', () => after.revisions.length.should.equal(3));
        it('should bring back the earlier text', () => currentRevisionOf(after, 'Home')!.text.should.equal('one'));
    });

    describe('and the screen is already there', () => {
        it('should record nothing', () => revertEvents(session, 'Home', 'r2', 'ada', countingDesignIds()).should.be.empty);
    });

    describe('and the revision is not the screen\'s', () => {
        it('should record nothing', () => revertEvents(session, 'Home', 'unknown', 'ada', countingDesignIds()).should.be.empty);
    });
});

describe('when undoing a whole turn', () => {
    const base = [
        revision('r1', 'Home', 'home 1'),
        revision('r2', 'Home', 'home 2', { turnId: 'turn-a' }),
        revision('r3', 'Settings', 'settings 1', { turnId: 'turn-a' }),
    ];
    const session = aSession(base);
    const events = revertTurnEvents(session, 'turn-a', 'ada', countingDesignIds(), 'undo-1');
    const after = foldDesignSession([started(), ...base, ...events])!;

    it('should take a screen back to the revision it was made from', () => currentRevisionOf(after, 'Home')!.text.should.equal('home 1'));
    it('should take out a screen the turn created', () => after.screens.map(entry => entry.screen).should.deep.equal(['Home']));
    it('should share one turn id between the restored revisions', () => events.filter(event => event.type === 'ScreenReverted').every(event => (event as { turnId?: string }).turnId === 'undo-1').should.equal(true));
    it('should offer the turn while it is current', () => revertibleTurns(session).should.deep.equal(['turn-a']));

    describe('and a screen was changed after the turn', () => {
        const later = aSession([...base, revision('r4', 'Home', 'home 3')]);
        const laterEvents = revertTurnEvents(later, 'turn-a', 'ada', countingDesignIds(), 'undo-2');

        it('should leave that screen alone', () => laterEvents.some(event => event.type === 'ScreenReverted').should.equal(false));
        it('should still undo the others', () => laterEvents.should.deep.equal([{ type: 'ScreenRemovedFromDesign', screen: 'Settings' }]));
    });
});

describe('when describing an operation', () => {
    it('should name a profile change', () => describeOperation({ op: 'profile', key: 'corners', value: 'Round' }).should.equal('Changed the corners to Round'));
    it('should name a move', () => describeOperation({ op: 'moveScreen', name: 'Home', index: 2 }).should.equal('Moved Home to position 3'));
});
