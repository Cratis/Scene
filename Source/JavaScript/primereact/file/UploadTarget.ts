// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The outcome of checking the `url` a file upload element names against the origin policy. */
export type UploadTarget =
    | {
        isValid: true;

        /** The address to send to: a relative address as authored, or a normalized absolute one. `undefined` when none was authored. */
        url: string | undefined;
    }
    | { isValid: false; message: string };
