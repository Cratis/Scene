// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenEditSession } from './EditSession';

// Holds the latest session outside of render, so an edit is always worked out from every edit before it. A component that
// worked from the session its last render held would let two edits in one tick overwrite each other.
export class SessionCell {
    constructor(private latest: ScreenEditSession, private readonly publish: (session: ScreenEditSession) => void) {}

    get current(): ScreenEditSession {
        return this.latest;
    }

    commit(change: (current: ScreenEditSession) => ScreenEditSession): ScreenEditSession {
        this.latest = change(this.latest);
        this.publish(this.latest);
        return this.latest;
    }
}
