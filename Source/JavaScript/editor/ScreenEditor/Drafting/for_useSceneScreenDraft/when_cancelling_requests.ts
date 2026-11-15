// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createSceneScreenDraftRequestGate } from '../useSceneScreenDraft';

describe('when coordinating Scene screen draft requests', () => {
    it('should refuse a second click in the same tick', () => {
        const gate = createSceneScreenDraftRequestGate();
        gate.start();
        (gate.start() === undefined).should.be.true;
    });
    it('should abort on discard or context change', () => {
        const gate = createSceneScreenDraftRequestGate();
        const first = gate.start()!;
        gate.invalidate();
        first.signal.aborted.should.be.true;
        gate.current(first).should.be.false;
    });
    it('should ignore an older completion after another request starts', () => {
        const gate = createSceneScreenDraftRequestGate();
        const first = gate.start()!;
        gate.invalidate();
        const second = gate.start()!;
        gate.finish(first);
        gate.current(first).should.be.false;
        gate.current(second).should.be.true;
        (gate.start() === undefined).should.be.true;
    });
    it('should allow generation again after completing', () => {
        const gate = createSceneScreenDraftRequestGate();
        const first = gate.start()!;
        gate.finish(first);
        (gate.start() !== undefined).should.be.true;
    });
});
