// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Version } from '@cratis/components/TimeMachine';
import { numberProperty, objectArrayProperty, stringProperty } from '../properties';

/**
 * Reads a `versions` property into the `Version` list `TimeMachine` renders.
 *
 * An entry without an `id`, a `label` and a parseable `timestamp` is dropped rather than defaulted,
 * because `TimeMachine`'s whole job is to place versions on a timeline: a version invented at the epoch
 * would not be a slightly wrong entry, it would silently reorder every real one around it. A dropped
 * entry is visibly one item short; a fabricated one is a timeline that lies.
 *
 * `content` is rendered as text. A version whose content is a whole element tree is not something a
 * property bag can carry, and pretending otherwise would be the wrong seam - that belongs in a screen
 * template, not in a property.
 */
export function timeMachineVersions(properties: Record<string, unknown>): Version[] {
    const entries = objectArrayProperty(properties, 'versions') ?? [];

    return entries
        .map((entry): Version | undefined => {
            const id = stringProperty(entry, 'id');
            const label = stringProperty(entry, 'label');
            const timestamp = timestampOf(entry);
            if (id === undefined || label === undefined || timestamp === undefined) return undefined;

            return { id, label, timestamp, content: stringProperty(entry, 'content') ?? '' };
        })
        .filter((version): version is Version => version !== undefined);
}

/**
 * Reads an entry's `timestamp`, accepting both the ISO string a `.play` screen writes and the epoch
 * number a serializer may produce, and rejecting anything that does not parse into a real date.
 */
function timestampOf(entry: Record<string, unknown>): Date | undefined {
    const value = stringProperty(entry, 'timestamp') ?? numberProperty(entry, 'timestamp');
    if (value === undefined) return undefined;

    const timestamp = new Date(value);
    return Number.isNaN(timestamp.getTime()) ? undefined : timestamp;
}
