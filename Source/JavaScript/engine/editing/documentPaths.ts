// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DocumentPath } from './DocumentIndex';

/**
 * Reads the value at a document path.
 */
export function getAtPath(root: unknown, path: DocumentPath): unknown {
    let current = root;
    for (const key of path) {
        if (current === null || typeof current !== 'object') return undefined;
        current = (current as Record<string | number, unknown>)[key];
    }

    return current;
}

/**
 * Reads the array at a path, creating it - and any objects on the way - when it is not there yet. Mutates `root`,
 * which callers hold a copy of.
 */
export function ensureArrayAt(root: unknown, path: DocumentPath): unknown[] {
    let current = root as Record<string | number, unknown>;
    path.forEach((key, position) => {
        if (current[key] === undefined) current[key] = position === path.length - 1 ? [] : {};
        current = current[key] as Record<string | number, unknown>;
    });

    return current as unknown as unknown[];
}

/**
 * The paths a change to `path` must be made at: the path itself and, for a node inside a freeform element, the same
 * place in every other size-class variant's copy.
 */
export function mirroredPaths(mirror: { prefix: DocumentPath; others: DocumentPath[] } | undefined, path: DocumentPath): DocumentPath[] {
    if (!mirror || mirror.prefix.some((key, position) => path[position] !== key)) return [path];
    return [path, ...mirror.others.map(other => [...other, ...path.slice(mirror.prefix.length)])];
}
