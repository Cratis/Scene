// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where an edit of a property goes.
 */
export enum EditTarget {
    /** The node itself. */
    Node = 'node',

    /** An instance contribution, because the node is inherited and the property is exposed. */
    Instance = 'instance',
}
