// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A host-owned effect that sends selected files to the server the screen specifies. */
export interface FileUploadHandler {
    /**
     * Uploads a selection without coupling the portable Scene package to a host's server client.
     *
     * @param files The files selected by the user.
     * @param serverUrl The optional legacy endpoint URL authored on the Scene element.
     */
    (files: File[], serverUrl?: string): Promise<void>;
}
