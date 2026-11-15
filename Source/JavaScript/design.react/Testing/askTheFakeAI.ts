// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignTurnResult } from '../Host/DesignCanvasHost';
import type { FakeDesignHost } from './createFakeDesignHost';

/**
 * Asks a fake host's scripted AI something outside the chat bar, so a story or a specification can start from a design that already has screens.
 * Each call is one turn with an id of its own.
 */
export async function askTheFakeAI(fake: FakeDesignHost, prompt: string, focus?: { screen?: string }): Promise<DesignTurnResult> {
    const ai = fake.host.ai;
    if (ai === undefined) throw new Error('The fake host has no AI.');
    const turnId = fake.host.ids?.next('turn') ?? `seed-${prompt}`;
    return ai.runTurn(
        { turnId, sessionId: 'seed', subject: fake.host.subject, mode: 'screens', prompt, author: fake.host.user.id, ...(focus === undefined ? {} : { focus }) },
        () => undefined, new AbortController().signal);
}
