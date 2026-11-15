// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignIds } from './DesignCanvasHost';

const randomId = (): string => {
    const crypto = globalThis.crypto as { randomUUID?: () => string } | undefined;
    return crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Ids that are random: what the canvas uses when its host does not make ids of its own. */
export const randomDesignIds: DesignIds = {
    next: kind => `${kind}-${randomId()}`,
};

/** Ids that count, per kind - for specifications and stories, where the result must be the same every run. */
export function countingDesignIds(): DesignIds {
    const counts = new Map<string, number>();
    return {
        next: kind => {
            const next = (counts.get(kind) ?? 0) + 1;
            counts.set(kind, next);
            return `${kind}-${next}`;
        },
    };
}
