// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SaveState } from '../Autosave/SaveState';
import { createHarness, settle, type Harness } from './given/an_autosave_controller';

describe('when an edit is made', () => {
    let harness: Harness;

    beforeEach(() => {
        harness = createHarness();
        harness.controller.edited('one');
    });

    it('should be pending', () => harness.controller.current.should.equal(SaveState.Pending));
    it('should not write before the period has elapsed', () => harness.written.length.should.equal(0));
});

describe('when the period has elapsed', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
    });

    it('should write the edit once', () => harness.written.should.deep.equal(['one']));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
    it('should have passed through saving', () => harness.states.should.deep.equal([SaveState.Pending, SaveState.Saving, SaveState.Saved]));
});

describe('when edits follow each other inside the period', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.controller.edited('one');
        harness.clock.advance(400);
        harness.controller.edited('two');
        harness.clock.advance(400);
        harness.controller.edited('three');
        harness.clock.advance(600);
        await settle();
    });

    it('should write only the last', () => harness.written.should.deep.equal(['three']));
});

describe('when the edit brings the document back to what is stored', () => {
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

describe('when flushed before the period has elapsed', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.controller.edited('one');
        await harness.controller.flush();
    });

    it('should write at once', () => harness.written.should.deep.equal(['one']));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when an edit is made while a write is in flight', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        const release = harness.holdNextWrite();
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
        harness.controller.edited('two');
        release();
        await settle();
        harness.clock.advance(600);
        await settle();
    });

    it('should write both, in order, never at the same time', () => harness.written.should.deep.equal(['one', 'two']));
    it('should end saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when the write fails', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.respondWith({ succeeded: false, messages: ['Nope'] });
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
    });

    it('should be failed', () => harness.controller.current.should.equal(SaveState.Failed));
    it('should keep the reason', () => harness.controller.messages.should.deep.equal(['Nope']));
    it('should not write again by itself', async () => {
        harness.clock.advance(5000);
        await settle();
        harness.written.length.should.equal(1);
    });
});

describe('when a failed write is retried and then succeeds', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.respondWith({ succeeded: false, messages: ['Nope'] });
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
        harness.respondWith({ succeeded: true, messages: [] });
        await harness.controller.retry();
    });

    it('should write the same document again', () => harness.written.should.deep.equal(['one', 'one']));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when the stored profile is reset from elsewhere', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.controller.edited('one');
        harness.controller.reset('other');
        harness.clock.advance(1000);
        await settle();
    });

    it('should drop the waiting write', () => harness.written.length.should.equal(0));
    it('should be saved', () => harness.controller.current.should.equal(SaveState.Saved));
});

describe('when documents are compared by value', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness(600, (left, right) => left.toLowerCase() === right.toLowerCase());
        harness.controller.edited('STORED');
        harness.clock.advance(1000);
        await settle();
    });

    it('should write nothing for a document equal to what is stored', () => harness.written.length.should.equal(0));
});

describe('when stopped and then edited again', () => {
    let harness: Harness;

    beforeEach(async () => {
        harness = createHarness();
        harness.controller.stop();
        harness.controller.edited('one');
        harness.clock.advance(600);
        await settle();
    });

    it('should still write the edit', () => harness.written.should.deep.equal(['one']));
});
