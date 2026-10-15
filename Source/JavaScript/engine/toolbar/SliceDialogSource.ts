// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a slice's dialog template comes from.
 */
export enum SliceDialogSource {
    /** The slice names its own dialog template. */
    Slice = 'slice',

    /** The slice names none, so the default form dialog is used. */
    Default = 'default',
}
