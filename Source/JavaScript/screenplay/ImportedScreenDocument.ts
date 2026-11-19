// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// A Scene document read back from Screenplay, with whom it belongs to - the mirror of ImportedScreenDocument.
export interface ImportedScreenDocument {
    // The identity of the slice the document belongs to; empty when it belongs to none.
    readonly sliceId: string;

    // The identity of the role the document is written for, when the carrier named one.
    readonly actorId?: string;

    // The name of the role the document is written for, when the screens named one.
    readonly roleName?: string;

    // The Scene document text, ready for a host's reader.
    readonly document: string;
}
