// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A host-owned effect that sends selected files to the server the screen specifies. */
export interface FileUploadHandler {
    /**
     * Uploads a selection without coupling the portable Scene package to a host's server client.
     *
     * @param files The files selected by the user.
     * @param serverUrl The upload address authored on the Scene element, after the origin policy accepted it
     * (same origin as the page, or one the host allowed). `undefined` when none was authored; an address the
     * policy refused never reaches the handler.
     */
    (files: File[], serverUrl?: string): Promise<void>;
}
