// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext } from 'react';
import { FileUploadHandler } from './FileUploadHandler';

/** What a host provides to the file uploads inside it. */
export interface FileUploadContextValue {
    /** The host-owned upload effect, when it owns the effect. */
    handler: FileUploadHandler | undefined;

    /** The origins, besides the page's own, an upload may be sent to. */
    allowedOrigins: readonly string[];
}

/** Without a provider an upload goes only to the page's own origin and the control makes the request itself. */
export const FileUploadContext = createContext<FileUploadContextValue>({ handler: undefined, allowedOrigins: [] });
