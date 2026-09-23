// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Behavior } from '../interactions';

/**
 * The root of every node in a Scene element tree. Named `SceneElement` rather than `Element` to avoid
 * colliding with the DOM's own global `Element` type, which every consumer of this package also has in scope.
 */
export interface SceneElement {
    id: string;
    properties: Record<string, unknown>;
    /**
     * The behaviors attached here - what happens when someone interacts with it. Additive with whatever is
     * attached further out or further in.
     */
    behaviors: Behavior[];
}

export const SceneElementPropertyNames: (keyof SceneElement)[] = ['id', 'properties', 'behaviors'];
