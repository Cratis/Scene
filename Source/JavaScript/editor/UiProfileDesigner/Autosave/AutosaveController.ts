// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SaveState } from './SaveState';

// The result of one write: whether it was stored, and the reasons when it was not.
export interface AutosaveOutcome {
    succeeded: boolean;
    messages: string[];
}

// The timers the controller uses; replaceable so a specification does not wait in real time.
export interface AutosaveClock {
    setTimeout(callback: () => void, milliseconds: number): unknown;
    clearTimeout(handle: unknown): void;
}

export const defaultAutosaveDelay = 600;

const realClock: AutosaveClock = {
    setTimeout: (callback, milliseconds) => globalThis.setTimeout(callback, milliseconds),
    clearTimeout: handle => globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>),
};

// Debounces writes of the profile: an edit schedules a write after a quiet period, edits inside it restart the period, only one
// write is in flight at a time, and what was edited while it ran is written next. A failed write keeps the edit and offers a retry
// instead of dropping it. Plain state and timers - no framework - so the rules are the same wherever it is hosted.
export class AutosaveController<T> {
    private latest: T | undefined;
    private stored: T | undefined;
    private hasPending = false;
    private halted = false;
    private timer: unknown;
    private inFlight: Promise<void> | undefined;
    private state = SaveState.Saved;
    private failure: string[] = [];

    constructor(
        private readonly write: (document: T) => Promise<AutosaveOutcome>,
        private readonly onChange: (state: SaveState, messages: string[]) => void,
        private readonly delay: number = defaultAutosaveDelay,
        private readonly clock: AutosaveClock = realClock,
        private readonly equals: (left: T, right: T) => boolean = Object.is) {}

    get current(): SaveState {
        return this.state;
    }

    get messages(): string[] {
        return this.failure;
    }

    // Tells the controller the stored profile is this one (opened, or reloaded because it changed from elsewhere).
    reset(stored: T): void {
        this.cancelTimer();
        this.stored = stored;
        this.latest = stored;
        this.hasPending = false;
        this.halted = false;
        this.setState(SaveState.Saved, []);
    }

    // The profile as the author has it now. Nothing is written when it is what is stored.
    edited(document: T): void {
        this.latest = document;
        const unchanged = this.stored !== undefined && this.equals(document, this.stored);
        if (unchanged && !this.hasPending) return;
        this.hasPending = !unchanged;
        if (this.hasPending) this.halted = false;
        if (!this.hasPending) {
            this.cancelTimer();
            if (!this.inFlight) this.setState(SaveState.Saved, []);
            return;
        }

        if (this.state !== SaveState.Saving) this.setState(SaveState.Pending, []);
        this.cancelTimer();
        this.timer = this.clock.setTimeout(() => { void this.flush(); }, this.delay);
    }

    // Writes now what is waiting, without waiting out the period - for leaving the page and for retrying a failure. Resolves when
    // nothing is waiting any more (or the write failed).
    async flush(): Promise<void> {
        this.cancelTimer();
        const waited = this.inFlight !== undefined;
        while (this.inFlight) await this.inFlight;
        // A caller that was waiting on the failed write does not write it again; a later, independent flush (leaving the page) does.
        if (this.halted && waited) return;
        this.halted = false;
        if (this.latest === undefined || !this.hasPending || (this.stored !== undefined && this.equals(this.latest, this.stored))) {
            this.hasPending = false;
            if (this.state !== SaveState.Failed) this.setState(SaveState.Saved, []);
            return;
        }

        const document = this.latest;
        this.setState(SaveState.Saving, []);
        const running = this.write(document).then(
            outcome => this.written(document, outcome),
            error => this.written(document, { succeeded: false, messages: [error instanceof Error ? error.message : String(error)] }));
        this.inFlight = running;
        await running;
        if (this.inFlight === running) this.inFlight = undefined;

        // What was edited while the write ran is written next, unless the write failed - that waits for a retry.
        if (this.state === SaveState.Pending) await this.flush();
    }

    // Tries again after a failure.
    retry(): Promise<void> {
        this.halted = false;
        this.hasPending = this.latest !== undefined && (this.stored === undefined || !this.equals(this.latest, this.stored));
        return this.flush();
    }

    // Stops the timer; whatever is waiting is the host's to flush first. A later edit starts it again, so a host that is mounted, unmounted and
    // mounted again (React in strict mode does exactly that) keeps a working controller.
    stop(): void {
        this.cancelTimer();
    }

    private written(document: T, outcome: AutosaveOutcome): void {
        if (outcome.succeeded) {
            this.stored = document;
            this.hasPending = this.latest !== undefined && !this.equals(this.latest, document);
            if (!this.hasPending) {
                this.setState(SaveState.Saved, []);
            } else {
                // Edited (or undone) while the write ran: still waiting, the next write carries what is current.
                this.setState(SaveState.Pending, []);
            }
            return;
        }

        // A refused write may have stored part of the document, so nothing is known to be stored: what is current stays waiting
        // and a retry writes it even when it equals what was stored before.
        this.stored = undefined;
        this.hasPending = this.latest !== undefined;
        this.halted = true;
        this.cancelTimer();
        this.setState(SaveState.Failed, outcome.messages);
    }

    private cancelTimer(): void {
        if (this.timer === undefined) return;
        this.clock.clearTimeout(this.timer);
        this.timer = undefined;
    }

    private setState(state: SaveState, messages: string[]): void {
        this.state = state;
        this.failure = messages;
        this.onChange(state, messages);
    }
}
