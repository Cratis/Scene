// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignComment } from '@cratis/scene.design';
import { countingDesignIds } from '../../Host/randomDesignIds';
import { anchorPin, commentEvents, commentsByElement, elementAt, placePins, type ElementBox } from '../commentPins';

const boxes: ElementBox[] = [
    { id: 'page', x: 0, y: 0, width: 400, height: 600 },
    { id: 'list', x: 20, y: 100, width: 360, height: 300 },
    { id: 'row', x: 30, y: 120, width: 340, height: 40 },
];

const comment = (id: string, extra: Partial<DesignComment> = {}): DesignComment =>
    ({ id, screen: 'Home', text: `text ${id}`, author: 'ada', resolved: false, ...extra });

describe('when anchoring a pin', () => {
    describe('and the point is over nested elements', () => {
        it('should pick the smallest element that holds it', () => elementAt({ x: 50, y: 130 }, boxes)!.id.should.equal('row'));
        it('should anchor to that element', () => anchorPin({ x: 50, y: 130 }, boxes).should.deep.equal({ elementId: 'row' }));
    });

    describe('and the point is over the outer element only', () => {
        it('should anchor to the outer element', () => anchorPin({ x: 5, y: 5 }, boxes).should.deep.equal({ elementId: 'page' }));
    });

    describe('and the point is over no element', () => {
        it('should keep the place it was put, rounded', () => anchorPin({ x: 500.4, y: 20.6 }, boxes).should.deep.equal({ position: { x: 500, y: 21 } }));
        it('should keep it when the screen has no elements at all', () => anchorPin({ x: 3, y: 4 }, []).should.deep.equal({ position: { x: 3, y: 4 } }));
    });
});

describe('when placing the pins of a screen', () => {
    const placed = placePins([
        comment('on-list', { elementId: 'list' }),
        comment('loose', { position: { x: 700, y: 10 } }),
        comment('gone', { elementId: 'removed' }),
        comment('elsewhere', { screen: 'Other', elementId: 'list' }),
    ], 'Home', boxes);

    it('should put an element\'s pin on the corner of the element', () => {
        const pin = placed.placed.find(candidate => candidate.comment.id === 'on-list')!;
        pin.should.include({ x: 370, y: 110, anchored: true });
    });
    it('should leave a loose pin where it was pinned', () => placed.placed.find(candidate => candidate.comment.id === 'loose')!.should.include({ x: 700, y: 10, anchored: false }));
    it('should have no place for a comment whose element is gone and was never pinned', () => placed.unplaced.map(candidate => candidate.id).should.deep.equal(['gone']));
    it('should not draw the comments of other screens', () => placed.placed.some(pin => pin.comment.id === 'elsewhere').should.equal(false));

    describe('and the element moves', () => {
        const moved = placePins([comment('on-list', { elementId: 'list' })], 'Home', [{ id: 'list', x: 100, y: 200, width: 100, height: 50 }]);

        it('should follow it', () => moved.placed[0]!.should.include({ x: 190, y: 210 }));
    });
});

describe('when telling the AI about comments', () => {
    const grouped = commentsByElement([
        comment('a', { elementId: 'list' }), comment('b', { elementId: 'list' }), comment('c'), comment('d', { elementId: 'list', resolved: true }), comment('e', { screen: 'Other', elementId: 'list' }),
    ], 'Home');

    it('should address the open comments by element', () => grouped.get('list')!.map(candidate => candidate.id).should.deep.equal(['a', 'b']));
    it('should keep comments about no element apart', () => grouped.get('')!.map(candidate => candidate.id).should.deep.equal(['c']));
    it('should leave out what is resolved or on another screen', () => [...grouped.keys()].should.deep.equal(['list', '']));
});

describe('when writing the events of a new comment', () => {
    describe('and an element is under the pin', () => {
        const events = commentEvents('Home', { elementId: 'list' }, 'Too wide', 'ada', countingDesignIds());

        it('should add the comment on the element', () => events.should.deep.equal([{ type: 'CommentAdded', commentId: 'comment-1', screen: 'Home', text: 'Too wide', author: 'ada', elementId: 'list' }]));
    });

    describe('and no element is under the pin', () => {
        const events = commentEvents('Home', { position: { x: 10, y: 20 } }, 'Move this', 'ada', countingDesignIds());

        it('should add the comment with no element', () => events[0]!.should.not.have.property('elementId'));
        it('should pin it to the position', () => events[1]!.should.deep.equal({ type: 'CommentPinned', commentId: 'comment-1', x: 10, y: 20 }));
    });
});
