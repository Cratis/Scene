// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What watches one element, and the element it watches. */
export interface Watching<T> {
    root: T;
    stop: () => void;
}

/**
 * Decides what watches the element on a render: the element may not exist yet (a child's first layout effect runs before the ref of the element around it is set),
 * so every render looks again - nothing starts until the element is there, one watcher is kept while it is the same element, and a replaced element is
 * watched anew with the old watcher stopped.
 *
 * @param current What watched the element before, if anything.
 * @param root The element now, if it exists.
 * @param start Starts watching an element; returns what stops it.
 * @returns What watches the element now.
 */
export function keepWatching<T>(current: Watching<T> | undefined, root: T | null | undefined, start: (root: T) => () => void): Watching<T> | undefined {
    if (!root) return current;
    if (current?.root === root) return current;
    current?.stop();
    return { root, stop: start(root) };
}
