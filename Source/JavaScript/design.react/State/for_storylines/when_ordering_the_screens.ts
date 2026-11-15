// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { foldDesignSession } from '@cratis/scene.design';
import { aSession, revision } from '../../given/aSession';
import { started } from '../../given/aStartedDesign';
import { addStoryline, arrowsOf, reorderEvents, screenSetOf, stepsOf, storylineNames, toggleStep } from '../storylines';

const session = aSession([revision('r1', 'List', 'a'), revision('r2', 'Details', 'b'), revision('r3', 'Pay', 'c')]);

describe('when ordering the screens of a design', () => {
    describe('and nobody has chosen a storyline', () => {
        const set = screenSetOf(session);

        it('should follow the screens in the default storyline', () => stepsOf(set, set.defaultStoryline).should.deep.equal(['List', 'Details', 'Pay']));
    });

    describe('and a screen is moved', () => {
        const events = reorderEvents(session, 'Pay', 0);
        const after = foldDesignSession([started(), revision('r1', 'List', 'a'), revision('r2', 'Details', 'b'), revision('r3', 'Pay', 'c'), ...events])!;

        it('should record the new order', () => events.should.deep.equal([{ type: 'ScreensReordered', screens: ['Pay', 'List', 'Details'] }]));
        it('should reorder the default storyline with the screens', () => stepsOf(screenSetOf(after), 'Default').should.deep.equal(['Pay', 'List', 'Details']));
    });

    describe('and a screen is moved where it already is', () => {
        it('should record nothing', () => reorderEvents(session, 'List', 0).should.be.empty);
    });

    describe('and the position is past the end', () => {
        it('should move to the end', () => reorderEvents(session, 'List', 99).should.deep.equal([{ type: 'ScreensReordered', screens: ['Details', 'Pay', 'List'] }]));
    });
});

describe('when the author has storylines of their own', () => {
    const set = screenSetOf(session, [{ name: 'Declined', steps: ['List', 'Pay', 'Gone'] }]);

    it('should offer the default storyline first', () => storylineNames(set).should.deep.equal(['Default', 'Declined']));
    it('should lay out their steps in order', () => stepsOf(set, 'Declined').should.deep.equal(['List', 'Pay']));
    it('should not offer a step the session no longer has', () => stepsOf(set, 'Declined').includes('Gone').should.equal(false));

    describe('and a screen is taken into one', () => {
        it('should be added at the end', () => toggleStep(set, 'Declined', 'Details')[0]!.steps.should.deep.equal(['List', 'Pay', 'Details']));
        it('should be taken out when it is there already', () => toggleStep(set, 'Declined', 'List')[0]!.steps.should.deep.equal(['Pay']));
    });

    describe('and a storyline is added', () => {
        it('should start empty', () => addStoryline(set, ' Alternative ')!.at(-1)!.should.deep.equal({ name: 'Alternative', steps: [] }));
        it('should refuse a name that is taken', () => (addStoryline(set, 'Declined') === undefined).should.equal(true));
        it('should refuse the default name', () => (addStoryline(set, 'Default') === undefined).should.equal(true));
        it('should refuse an empty name', () => (addStoryline(set, '  ') === undefined).should.equal(true));
    });
});

describe('when drawing the arrows of a storyline', () => {
    const arrows = arrowsOf(['List', 'Details', 'Pay'], [{ from: 'List', element: 'open', prop: 'destination', to: 'Details' }]);

    it('should join each step to the next', () => arrows.map(arrow => `${arrow.from}>${arrow.to}`).should.deep.equal(['List>Details', 'Details>Pay']));
    it('should mark the ones a screen really navigates by', () => arrows.map(arrow => arrow.linked).should.deep.equal([true, false]));
});
