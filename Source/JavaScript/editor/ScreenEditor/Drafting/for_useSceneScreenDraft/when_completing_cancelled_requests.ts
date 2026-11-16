// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createSceneScreenDraftRequestGate } from '../useSceneScreenDraft';

const deferred = () => {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>(complete => { resolve = complete; });
    return { promise, resolve };
};

describe('when an advisory-cancelled transport completes a Scene screen draft', () => {
    it('should ignore an old completion after a newer request starts', async () => {
        const gate = createSceneScreenDraftRequestGate();
        const first = gate.start()!;
        const old = deferred();
        const accepted: string[] = [];
        const oldCompletion = old.promise.then(answer => { if (gate.current(first)) accepted.push(answer); gate.finish(first); });
        gate.invalidate();
        const second = gate.start()!;
        old.resolve('old draft');
        await oldCompletion;
        accepted.should.deep.equal([]);
        gate.current(second).should.be.true;
        (gate.start() === undefined).should.be.true;
        first.signal.aborted.should.be.true;
    });

    it('should ignore an unmounted or discarded request even if transport ignores abort', async () => {
        const gate = createSceneScreenDraftRequestGate();
        const request = gate.start()!;
        const transport = deferred();
        const accepted: string[] = [];
        const completion = transport.promise.then(answer => { if (gate.current(request)) accepted.push(answer); });
        gate.invalidate();
        transport.resolve('late draft');
        await completion;
        accepted.should.deep.equal([]);
        request.signal.aborted.should.be.true;
    });

    it('should accept only the active completion', async () => {
        const gate = createSceneScreenDraftRequestGate();
        const request = gate.start()!;
        const transport = deferred();
        const accepted: string[] = [];
        const completion = transport.promise.then(answer => { if (gate.current(request)) accepted.push(answer); gate.finish(request); });
        transport.resolve('current draft');
        await completion;
        accepted.should.deep.equal(['current draft']);
        (gate.start() !== undefined).should.be.true;
    });
});
