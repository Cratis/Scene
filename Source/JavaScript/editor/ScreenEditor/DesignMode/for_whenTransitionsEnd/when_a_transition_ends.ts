// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { whenTransitionsEnd } from '../whenTransitionsEnd';

describe('when a transition ends under the target', () => {
    const target = new EventTarget();
    let calls = 0;
    const stop = whenTransitionsEnd(target, () => calls++);
    target.dispatchEvent(new Event('transitionend'));
    target.dispatchEvent(new Event('animationend'));
    target.dispatchEvent(new Event('transitioncancel'));
    stop();
    it('should say so for each ending', () => calls.should.equal(3));
});

describe('when it has stopped listening', () => {
    const target = new EventTarget();
    let calls = 0;
    whenTransitionsEnd(target, () => calls++)();
    target.dispatchEvent(new Event('transitionend'));
    it('should say nothing', () => calls.should.equal(0));
});

describe('when something else happens under the target', () => {
    const target = new EventTarget();
    let calls = 0;
    const stop = whenTransitionsEnd(target, () => calls++);
    target.dispatchEvent(new Event('click'));
    stop();
    it('should say nothing', () => calls.should.equal(0));
});
