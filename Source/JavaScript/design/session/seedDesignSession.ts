// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSubject } from '../subject/DesignSubject';
import { DesignSession, currentRevisionOf } from './DesignSession';
import { DesignSessionEvent } from './DesignSessionEvents';

export interface DesignSessionSeed {
    sessionId: string;
    subject: DesignSubject;
    startedBy: string;
    /** Makes the id of the revision a copied screen starts with. Defaults to `<session>/<screen>/1`. */
    revisionId?: (screen: string) => string;
}

/**
 * The events that start a session from another session's screens - a story's design becoming the design of the issue filed from it. Each screen
 * is copied as the first revision of its own and linked to the revision of the source it was copied from, so the history says where it began.
 * The new session has the source's mode and template set; it is not changed by what happens to the source afterwards.
 */
export function seedDesignSession(source: DesignSession, seed: DesignSessionSeed): DesignSessionEvent[] {
    const events: DesignSessionEvent[] = [{
        type: 'DesignSessionStarted', sessionId: seed.sessionId, subject: seed.subject, mode: source.mode, startedBy: seed.startedBy, seededFromSessionId: source.id,
        ...(source.templateSet === undefined ? {} : { templateSet: [...source.templateSet] }),
    }];
    for (const entry of source.screens) {
        const revision = currentRevisionOf(source, entry.screen);
        if (revision === undefined) continue;
        events.push({
            type: 'ScreenRevisionRecorded', revisionId: seed.revisionId?.(entry.screen) ?? `${seed.sessionId}/${entry.screen}/1`, screen: entry.screen, text: revision.text,
            operations: [], author: seed.startedBy, originSessionId: source.id, originRevisionId: revision.id,
            ...(revision.designSystemVersion === undefined ? {} : { designSystemVersion: revision.designSystemVersion }),
        });
    }
    return events;
}
