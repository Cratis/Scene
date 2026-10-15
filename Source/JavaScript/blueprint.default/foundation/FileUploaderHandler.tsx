// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';

/**
 * What sends the accepted files somewhere: a host's server client, kept out of the portable package.
 *
 * The signature is the one `@cratis/scene.primereact` uses for its `fileUpload`, so a host hands the same function to both. A handler that
 * rejects marks the files as failed, with a retry; without a handler the uploader only collects and publishes the selection.
 */
export type FileUploaderHandler = (files: File[], serverUrl?: string) => Promise<void>;

const Context = createContext<FileUploaderHandler | undefined>(undefined);

/** Provides the upload handler to the file uploaders below it. */
export function FileUploaderHandlerProvider({ handler, children }: { handler?: FileUploaderHandler; children: ReactNode }) {
    return <Context.Provider value={handler}>{children}</Context.Provider>;
}

/** The handler in scope, if any. */
export const useFileUploaderHandler = (): FileUploaderHandler | undefined => useContext(Context);
