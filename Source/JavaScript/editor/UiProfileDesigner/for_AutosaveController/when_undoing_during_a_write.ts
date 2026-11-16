// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SaveState } from '../Autosave/SaveState';
import { createHarness, settle, type Harness } from './given/an_autosave_controller';

// Writes `one` while `stored` is the acknowledged document, holds it open, and leaves the specification at the point after `edited('stored')` (the undo).
const holdWriteAndUndo = async (harness: Harness) => {
    harness.holdEveryWrite();
    harness.controller.edited('one');
    harness.clock.advance(600);
    await settle();
    harness.controller.edited('stored');
};

describe('when the author undoes to the acknowledged document while a write is in flight', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        await holdWriteAndUndo(harness);
        harness.held[0].succeed();
        await settle();
    });

    it('should write the document that is current after the first write', () => harness.written.should.deep.equal(['one', 'stored']));
    it('should not be saved before that write completes', () => harness.controller.current.should.equal(SaveState.Saving));
    it('should have one write in flight', () => harness.activeWrites().should.equal(1));

    describe('and the compensating write completes', () => {
        beforeEach(async () => {
            harness.held[1].succeed();
            await settle();
        });

        it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
        it('should never have written two at once', () => harness.mostActiveWrites().should.equal(1));
        it('should write nothing more', async () => {
            harness.clock.advance(5000);
            await settle();
            harness.written.length.should.equal(2);
        });
    });

    describe('and the compensating write is refused', () => {
        beforeEach(async () => {
            harness.held[1].refuse(['Nope']);
            await settle();
        });

        it('should be failed with the reason', () => {
            harness.controller.current.should.equal(SaveState.Failed);
            harness.controller.messages.should.deep.equal(['Nope']);
        });

        it('should not write again by itself', async () => {
            harness.clock.advance(5000);
            await settle();
            harness.written.length.should.equal(2);
        });

        it('should write the current document again when retried', async () => {
            const retried = harness.controller.retry();
            await settle();
            harness.held[2].succeed();
            await retried;
            harness.written.should.deep.equal(['one', 'stored', 'stored']);
            harness.controller.current.should.equal(SaveState.Saved);
        });
    });
});

describe('when the author undoes before the period has elapsed', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.controller.edited('one');
        harness.controller.edited('stored');
        harness.clock.advance(1000);
        await settle();
    });

    it('should write nothing', () => harness.written.length.should.equal(0));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
    it('should have no timer left', () => harness.clock.waiting.should.equal(0));
});

describe('when the author undoes and redoes while a write is in flight', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        await holdWriteAndUndo(harness);
        harness.controller.edited('one');
        harness.held[0].succeed();
        await settle();
        harness.clock.advance(1000);
        await settle();
    });

    it('should write only once', () => harness.written.should.deep.equal(['one']));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when the author undoes, redoes and edits again while a write is in flight', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        await holdWriteAndUndo(harness);
        harness.controller.edited('one');
        harness.controller.edited('three');
        harness.held[0].succeed();
        await settle();
        harness.clock.advance(600);
        await settle();
        harness.held[1]?.succeed();
        await settle();
    });

    it('should write the first and then the last', () => harness.written.should.deep.equal(['one', 'three']));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when the author edits again while the compensating write is in flight', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        await holdWriteAndUndo(harness);
        harness.held[0].succeed();
        await settle();
        harness.controller.edited('three');
        harness.held[1].succeed();
        await settle();
        harness.held[2]?.succeed();
        await settle();
    });

    it('should write what is current next', () => harness.written.should.deep.equal(['one', 'stored', 'three']));
    it('should never have written two at once', () => harness.mostActiveWrites().should.equal(1));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when the timer and explicit flushes overlap while a write is in flight', () => {
    let harness: Harness;
    let finished: number;

    beforeEach(async () => {
        harness = createHarness();
        finished = 0;
        await holdWriteAndUndo(harness);
        void harness.controller.flush().then(() => finished++);
        void harness.controller.flush().then(() => finished++);
        harness.held[0].succeed();
        await settle();
    });

    it('should not finish a waiter before the compensating write completes', () => finished.should.equal(0));

    it('should write each document once and finish every waiter afterwards', async () => {
        harness.held[1].succeed();
        await settle();
        harness.written.should.deep.equal(['one', 'stored']);
        finished.should.equal(2);
        harness.mostActiveWrites().should.equal(1);
    });
});

describe('when a write fails while flushes are waiting for it', () => {
    let harness: Harness;
    let finished: number;

    beforeEach(async () => {
        harness = createHarness();
        finished = 0;
        harness.holdEveryWrite();
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
        void harness.controller.flush().then(() => finished++);
        void harness.controller.flush().then(() => finished++);
        harness.held[0].reject(new Error('Broken'));
        await settle();
        harness.clock.advance(5000);
        await settle();
    });

    it('should be failed with the reason', () => {
        harness.controller.current.should.equal(SaveState.Failed);
        harness.controller.messages.should.deep.equal(['Broken']);
    });

    it('should not write the failed document again', () => harness.written.should.deep.equal(['one']));
    it('should finish every waiter', () => finished.should.equal(2));

    it('should write again when a fresh edit is made', async () => {
        harness.controller.edited('two');
        harness.clock.advance(600);
        await settle();
        harness.written.should.deep.equal(['one', 'two']);
    });
});

describe('when the write fails after the author undid to the acknowledged document', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        await holdWriteAndUndo(harness);
        harness.held[0].refuse(['Nope']);
        await settle();
    });

    it('should be failed, not saved', () => harness.controller.current.should.equal(SaveState.Failed));
    it('should not write again by itself', async () => {
        harness.clock.advance(5000);
        await settle();
        harness.written.should.deep.equal(['one']);
    });

    it('should write the current document when retried, as the failed write may have stored part of it', async () => {
        const retried = harness.controller.retry();
        await settle();
        harness.held[1].succeed();
        await retried;
        harness.written.should.deep.equal(['one', 'stored']);
        harness.controller.current.should.equal(SaveState.Saved);
    });
});

describe('when the author leaves the page after a write was refused', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.holdEveryWrite();
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
        harness.held[0].refuse(['Nope']);
        await settle();
        void harness.controller.flush();
        await settle();
    });

    it('should write the current document again', () => harness.written.should.deep.equal(['one', 'one']));

    it('should be saved when that write succeeds', async () => {
        harness.held[1].succeed();
        await settle();
        harness.controller.current.should.equal(SaveState.Saved);
    });
});

describe('when the author undid to the acknowledged document, the write was refused and the page is left', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        await holdWriteAndUndo(harness);
        harness.held[0].refuse(['Nope']);
        await settle();
        void harness.controller.flush();
        await settle();
    });

    it('should write the current document, as the refused write may have stored part of it', () => harness.written.should.deep.equal(['one', 'stored']));
});
