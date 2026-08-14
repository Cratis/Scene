// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The root of every node in a Scene element tree. Named `SceneElement` rather than `Element` to avoid
 * colliding with the DOM's own global `Element` type, which every consumer of this package also has in scope.
 */
export interface SceneElement {
    id: string;
    properties: Record<string, unknown>;
}

export const SceneElementPropertyNames: (keyof SceneElement)[] = ['id', 'properties'];
