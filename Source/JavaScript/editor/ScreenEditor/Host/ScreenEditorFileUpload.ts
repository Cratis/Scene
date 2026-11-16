// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FileUploadHandler } from '@cratis/scene.primereact';

// How a host lets the file upload control reach its server. Neither is required: without a handler the control posts the files
// itself to the address its author configured, and only when someone presses upload.
export interface ScreenEditorFileUpload {

    // The host's own upload effect. It is called only for an address the origin policy accepted.
    handler?: FileUploadHandler;

    // Origins besides the page's own that an authored upload address may name. Every other origin is refused before anything is
    // sent. An address an author configured is never rewritten or replaced by the host.
    allowedOrigins?: readonly string[];
}
