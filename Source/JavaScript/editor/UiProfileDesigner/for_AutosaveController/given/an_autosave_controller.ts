// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { AutosaveController, type AutosaveClock, type AutosaveOutcome } from '../../Autosave/AutosaveController';
import type { SaveState } from '../../Autosave/SaveState';

// A clock that only moves when told, so a specification never waits in real time.
export class ManualClock implements AutosaveClock {
    private nextHandle = 1;
    private readonly scheduled = new Map<number, { due: number; callback: () => void }>();
    private now = 0;

    setTimeout(callback: () => void, milliseconds: number): unknown {
        const handle = this.nextHandle++;
        this.scheduled.set(handle, { due: this.now + milliseconds, callback });
        return handle;
    }

    clearTimeout(handle: unknown): void {
        this.scheduled.delete(handle as number);
    }

    advance(milliseconds: number): void {
        this.now += milliseconds;
        for (const [handle, entry] of [...this.scheduled]) {
            if (entry.due <= this.now) {
                this.scheduled.delete(handle);
                entry.callback();
            }
        }
    }

    get waiting(): number {
        return this.scheduled.size;
    }
}

// One write that is held open until the specification completes it.
export interface HeldWrite {
    document: string;
    succeed: () => void;
    refuse: (messages: string[]) => void;
    reject: (error: Error) => void;
}

export interface Harness {
    controller: AutosaveController<string>;
    clock: ManualClock;
    written: string[];
    states: SaveState[];
    respondWith: (outcome: AutosaveOutcome) => void;

    // Holds the next write open until released, to edit while it runs.
    holdNextWrite: () => () => void;

    // Holds every write open, each completed on its own; the writes started and never completed are in `held`.
    holdEveryWrite: () => void;
    held: HeldWrite[];
    activeWrites: () => number;
    mostActiveWrites: () => number;
}

export function createHarness(delay = 600, equals?: (left: string, right: string) => boolean): Harness {
    const clock = new ManualClock();
    const written: string[] = [];
    const states: SaveState[] = [];
    let outcome: AutosaveOutcome = { succeeded: true, messages: [] };
    let hold: Promise<void> | undefined;
    let holdEvery = false;
    let active = 0;
    let most = 0;
    const held: HeldWrite[] = [];

    const controller = new AutosaveController<string>(
        async document => {
            written.push(document);
            active++;
            most = Math.max(most, active);
            try {
                if (holdEvery) {
                    return await new Promise<AutosaveOutcome>((resolve, reject) => {
                        held.push({
                            document,
                            succeed: () => resolve({ succeeded: true, messages: [] }),
                            refuse: messages => resolve({ succeeded: false, messages }),
                            reject,
                        });
                    });
                }

                if (hold) await hold;
                return outcome;
            } finally {
                active--;
            }
        },
        state => states.push(state),
        delay,
        clock,
        equals);
    controller.reset('stored');
    states.length = 0;

    return {
        controller,
        clock,
        written,
        states,
        respondWith: next => { outcome = next; },
        holdEveryWrite: () => { holdEvery = true; },
        held,
        activeWrites: () => active,
        mostActiveWrites: () => most,
        holdNextWrite: () => {
            let release!: () => void;
            hold = new Promise<void>(resolve => { release = () => { hold = undefined; resolve(); }; });
            return release;
        },
    };
}

export const settle = async (): Promise<void> => {
    for (let turn = 0; turn < 10; turn++) await Promise.resolve();
};
