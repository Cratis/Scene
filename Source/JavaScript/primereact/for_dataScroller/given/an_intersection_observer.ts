// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { vi } from 'vitest';

/** A controllable `IntersectionObserver`: jsdom has no layout, so a specification says when the end is reached. */
export class ObservedEnd {
    static all: ObservedEnd[] = [];

    disconnected = false;
    target: Element | undefined;

    constructor(readonly callback: (entries: { isIntersecting: boolean }[]) => void, readonly options: IntersectionObserverInit) {
        ObservedEnd.all.push(this);
    }

    observe(target: Element) { this.target = target; }
    disconnect() { this.disconnected = true; }
    unobserve() { this.target = undefined; }

    /** The observers still watching a sentinel. */
    static get active() { return ObservedEnd.all.filter(observer => !observer.disconnected); }

    /** Says the end of the list is on screen. */
    static reach() { ObservedEnd.active.forEach(observer => observer.callback([{ isIntersecting: true }])); }

    static install() {
        ObservedEnd.all = [];
        vi.stubGlobal('IntersectionObserver', ObservedEnd);
    }
}
