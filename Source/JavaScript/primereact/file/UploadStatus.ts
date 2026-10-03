// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a file upload last reported to the person using it. */
export interface UploadStatus {
    /** `error` is announced assertively; `success` politely. */
    kind: 'success' | 'error';
    text: string;
}
