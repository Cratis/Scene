// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSessionEvent } from '@cratis/scene.design';
import type { DesignSessionStore } from '../Host/DesignCanvasHost';

/** A session store the events of which live in memory: what a story, a specification or a first prototype of a host persists into. */
export interface InMemoryDesignSessionStore extends DesignSessionStore {
    /** Adds events as if another writer - the server's design turn, another tab - had appended them. */
    publish(events: readonly DesignSessionEvent[]): void;
}

export function createInMemorySessionStore(initial: readonly DesignSessionEvent[] = []): InMemoryDesignSessionStore {
    let events: readonly DesignSessionEvent[] = [...initial];
    const listeners = new Set<() => void>();
    const publish = (added: readonly DesignSessionEvent[]) => {
        if (added.length === 0) return;
        events = [...events, ...added];
        listeners.forEach(listener => listener());
    };
    return {
        getEvents: () => events,
        subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        append: async added => { publish(added); },
        publish,
    };
}
