// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { QuillLoader } from './QuillLoader';
import { QuillLoaderContext } from './QuillLoaderContext';

export interface QuillLoaderProviderProps {
    /** Loads Quill. `loadQuill` from `@cratis/scene.primereact/quill` is the ready-made one. */
    loader: QuillLoader;

    /** The surface whose editors the loader serves. */
    children: ReactNode;
}

/**
 * Makes editable rich text available to the `editor` controls inside it.
 *
 * The loader must be a stable reference - define it at module level or memoize it - because the editor
 * rebuilds when it changes.
 */
export function QuillLoaderProvider({ loader, children }: QuillLoaderProviderProps) {
    return <QuillLoaderContext.Provider value={loader}>{children}</QuillLoaderContext.Provider>;
}
