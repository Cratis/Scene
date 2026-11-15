// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What an edit to the package selection did. */
export enum PackageEditKind {
    /** The package was added to the selection. */
    Added = 'added',

    /** The package left the profile entirely. */
    Removed = 'removed',

    /** The package is no longer chosen but stays, because another package of the profile requires it. */
    RemovedButStillRequired = 'removedButStillRequired',

    /** The edit is not allowed; `requiredBy` says what stands in the way. */
    Blocked = 'blocked',

    /** Nothing changed. */
    Unchanged = 'unchanged',
}
