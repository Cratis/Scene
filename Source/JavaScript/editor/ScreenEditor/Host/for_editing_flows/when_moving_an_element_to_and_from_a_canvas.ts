// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { authoredRoot } from '../../Document/studioScreen';
import { canvasMoveEdits } from '../../Document/canvasMoveEdits';
import { placementOf } from '../../Document/placeOnCanvas';
import { applyAllToSession, openSession, undo } from '../../Session/EditSession';
import { childrenOfElement, findSceneElement } from '../../Selection/sceneTree';
import { composedScreen, describeComposition, screenContext } from './given_a_composed_screen';

// The composed screen holds, under its root: an empty row, an empty canvas and a button.
const roots = () => describeComposition(composedScreen(), screenContext()).composition.roots;
const move = (session: ReturnType<typeof openSession>, nodeId: string, targetParentId: string, index: number, at?: { left: number; top: number }, measure?: (id: string, canvasId: string) => { height: number; bottom: number } | undefined) => {
    const edits = canvasMoveEdits(describeComposition(session.document, screenContext()).composition.roots, { nodeId, targetParentId, index }, at, measure);
    return { edits, session: edits ? applyAllToSession(session, edits, screenContext(), 'Move') : session };
};
const element = (session: ReturnType<typeof openSession>, id: string) => findSceneElement([authoredRoot(session.document)!], id)!;
const idsUnder = (session: ReturnType<typeof openSession>, id: string) => childrenOfElement(element(session, id)).map(child => (child as { id: string }).id);

describe('when moving an element between two things in flow', () => {
    it('should need nothing beyond a plain move', () => (canvasMoveEdits(roots(), { nodeId: 'button', targetParentId: 'row', index: 0 }) === undefined).should.be.true);
});

describe('when moving an element into a canvas at the point it was dropped', () => {
    const moved = move(openSession(composedScreen()), 'button', 'canvas', 0, { left: 120.4, top: 64.6 });

    it('should put it in the canvas', () => idsUnder(moved.session, 'canvas').should.deep.equal(['button']));
    it('should take it out of where it was', () => idsUnder(moved.session, 'screen-root').should.not.include('button'));
    it('should give it the position of the drop', () => placementOf(element(moved.session, 'button'))!.should.deep.equal({ left: 120, top: 65 }));
    it('should be one undo step', () => idsUnder(undo(moved.session), 'screen-root').should.include('button'));
    it('should restore the element without a position on undo', () => (placementOf(element(undo(moved.session), 'button')) === undefined).should.be.true);
});

describe('when moving an element into a canvas with no drop point', () => {
    it('should still give it a position, so it does not land in the corner on top of the others', () => (placementOf(element(move(openSession(composedScreen()), 'button', 'canvas', 0).session, 'button')) !== undefined).should.be.true);
});

describe('when moving an element into a canvas that already holds one, with no drop point', () => {
    const first = move(openSession(composedScreen()), 'button', 'canvas', 0, { left: 16, top: 16 }).session;

    it('should go below the one there, clear of its measured height', () => {
        const withText = applyAllToSession(first, [], screenContext(), 'None');
        const below = placementOf(element(move(withText, 'row', 'canvas', 1, undefined, id => id === 'button' ? { height: 90, bottom: 16 + 90 } : undefined).session, 'row'))!;
        (below.top >= 16 + 90).should.be.true;
    });
});

describe('when moving an element out of a canvas', () => {
    const inCanvas = move(openSession(composedScreen()), 'button', 'canvas', 0, { left: 10, top: 20 }).session;
    const out = move(inCanvas, 'button', 'row', 0);

    it('should put it in its new container', () => idsUnder(out.session, 'row').should.deep.equal(['button']));
    it('should take its position off', () => (placementOf(element(out.session, 'button')) === undefined).should.be.true);
    it('should leave no left or top among what it holds', () => Object.keys((element(out.session, 'button') as unknown as { properties: object }).properties).filter(key => key.startsWith('Canvas.')).should.deep.equal([]));
    it('should be one undo step', () => placementOf(element(undo(out.session), 'button'))!.should.deep.equal({ left: 10, top: 20 }));
});

describe('when dragging an element within a canvas', () => {
    const inCanvas = move(openSession(composedScreen()), 'button', 'canvas', 0, { left: 10, top: 20 }).session;
    const dragged = move(inCanvas, 'button', 'canvas', 1, { left: 200, top: 150 });

    it('should reposition it', () => placementOf(element(dragged.session, 'button'))!.should.deep.equal({ left: 200, top: 150 }));
    it('should keep it in the canvas, once', () => idsUnder(dragged.session, 'canvas').should.deep.equal(['button']));
    it('should be one undo step', () => placementOf(element(undo(dragged.session), 'button'))!.should.deep.equal({ left: 10, top: 20 }));
});
