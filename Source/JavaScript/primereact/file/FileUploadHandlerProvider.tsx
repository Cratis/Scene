// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useMemo } from 'react';
import { FileUploadContext } from './FileUploadContext';
import { FileUploadHandler } from './FileUploadHandler';

export interface FileUploadHandlerProviderProps {
    /**
     * The host-owned upload effect available to the enclosed Scene surface. When omitted the control posts the
     * files itself, to the authored address, under the origin policy.
     */
    handler?: FileUploadHandler;

    /**
     * Origins besides the page's own that an authored upload address may name, for example
     * `['https://files.example.com']`. An address on any other origin is refused before anything is sent - to
     * the handler as well. Cookies are never sent to these origins.
     */
    allowedOrigins?: readonly string[];

    /** The surface whose file uploads the host configures. */
    children: ReactNode;
}

/**
 * Makes a host's upload effect and origin policy available without coupling the Scene package to that host's
 * server client.
 */
export function FileUploadHandlerProvider({ handler, allowedOrigins = [], children }: FileUploadHandlerProviderProps) {
    const value = useMemo(() => ({ handler, allowedOrigins }), [handler, allowedOrigins]);
    return <FileUploadContext.Provider value={value}>{children}</FileUploadContext.Provider>;
}
