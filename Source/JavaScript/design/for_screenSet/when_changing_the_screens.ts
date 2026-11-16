// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { addScreenToSet, createScreenSet, moveScreenInSet, removeScreenFromSet, withStoryline } from '../index';

describe('when changing the screens of a set', () => {
    const start = withStoryline(createScreenSet(['A', 'B', 'C']), { name: 'Pay', steps: ['C', 'A'] });

    it('should keep the default storyline in screen order as a screen is added', () => addScreenToSet(start, 'X', 1).storylines[0].steps.should.deep.equal(['A', 'X', 'B', 'C']));
    it('should keep it in order as a screen is moved', () => moveScreenInSet(start, 'C', 0).storylines[0].steps.should.deep.equal(['C', 'A', 'B']));
    it('should leave the storylines of the author alone when a screen is moved', () => moveScreenInSet(start, 'C', 0).storylines[1].steps.should.deep.equal(['C', 'A']));
    it('should take a removed screen out of every storyline', () => removeScreenFromSet(start, 'C').storylines.map(storyline => storyline.steps).should.deep.equal([['A', 'B'], ['A']]));
    it('should not let the default storyline be replaced', () => withStoryline(start, { name: 'Default', steps: ['B'] }).should.equal(start));
});
