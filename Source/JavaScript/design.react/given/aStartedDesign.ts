// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { type DesignMode, type DesignSession, type DesignSessionEvent, foldDesignSession } from '@cratis/scene.design';
import { createFakeDesignHost, type FakeDesignHost, type FakeDesignHostOptions } from '../Testing/createFakeDesignHost';

export const started = (mode: DesignMode = 'screens', templateSet?: string[]): DesignSessionEvent => ({
    type: 'DesignSessionStarted', sessionId: 'session-1', subject: { kind: 'story', id: 'story-1' }, mode, startedBy: 'ada', ...(templateSet === undefined ? {} : { templateSet }),
});

/** A fake host whose session has started, on the real runtime's catalogue. */
export function aStartedDesign(options: FakeDesignHostOptions & { mode?: DesignMode; templateSet?: string[] } = {}): FakeDesignHost {
    return createFakeDesignHost({ ...options, events: [started(options.mode, options.templateSet), ...(options.events ?? [])] });
}

/** The session as the fake host's events fold it. */
export const sessionOf = (fake: FakeDesignHost): DesignSession => foldDesignSession(fake.store.getEvents())!;
