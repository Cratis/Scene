// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** How a pill for a status value is coloured. */
export enum SampleStatus {
    /** A positive state: active, delivered, approved. */
    Good = 'good',

    /** A state that is in progress or waiting. */
    Pending = 'pending',

    /** A negative state: rejected, overdue, out of stock. */
    Bad = 'bad',

    /** Anything else; the class of every value the pack does not name. */
    Neutral = 'neutral',
}
