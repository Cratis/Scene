// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { keepWatching, type Watching } from '../keepWatching';

const first = { name: 'first' };
const second = { name: 'second' };

function recorder() {
    const log: string[] = [];
    return { log, start: (root: { name: string }) => { log.push(`start ${root.name}`); return () => log.push(`stop ${root.name}`); } };
}

describe('when the element is not there on the first render', () => {
    const { log, start } = recorder();
    const result = keepWatching<{ name: string }>(undefined, null, start);
    it('should watch nothing yet', () => (result === undefined).should.be.true);
    it('should not start', () => log.length.should.equal(0));
});

describe('when the element has arrived on a later render', () => {
    const { log, start } = recorder();
    const beforeArrival = keepWatching<{ name: string }>(undefined, null, start);
    const result = keepWatching(beforeArrival, first, start);
    it('should watch it', () => result!.root.should.equal(first));
    it('should have started once', () => log.should.deep.equal(['start first']));
});

describe('when the same element is rendered again', () => {
    const { log, start } = recorder();
    const watching = keepWatching<{ name: string }>(undefined, first, start);
    const result = keepWatching(watching, first, start);
    it('should keep the same watcher', () => (result as Watching<{ name: string }>).should.equal(watching));
    it('should not start another', () => log.should.deep.equal(['start first']));
});

describe('when the element is replaced', () => {
    const { log, start } = recorder();
    const watching = keepWatching<{ name: string }>(undefined, first, start);
    const result = keepWatching(watching, second, start);
    it('should watch the new element', () => result!.root.should.equal(second));
    it('should stop watching the old one before starting on the new one', () => log.should.deep.equal(['start first', 'stop first', 'start second']));
});

describe('when the element is gone for a render', () => {
    const { log, start } = recorder();
    const watching = keepWatching<{ name: string }>(undefined, first, start);
    const result = keepWatching(watching, null, start);
    it('should keep what watches until the element is there again', () => (result as Watching<{ name: string }>).should.equal(watching));
    it('should not stop it', () => log.should.deep.equal(['start first']));
});
