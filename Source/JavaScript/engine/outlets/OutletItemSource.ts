// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How an item came into an outlet.
 */
export enum OutletItemSource {
    /** A default item of the outlet's declaration. */
    Default = 'default',

    /** An item a lower level added when it extended or overrode the outlet. */
    Own = 'own',

    /** An item a level contributed. */
    Contribution = 'contribution',
}
