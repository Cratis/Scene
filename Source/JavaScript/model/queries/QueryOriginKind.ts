// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What kind of model element owns a query.
 */
export enum QueryOriginKind {
    /** A feature of the application model. */
    Feature = 'feature',

    /** A slice within a feature. */
    Slice = 'slice',
}
