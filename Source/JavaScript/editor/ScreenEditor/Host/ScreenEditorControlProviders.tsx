// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { FileUploadHandlerProvider, QuillLoaderProvider } from '@cratis/scene.primereact';
import './ScreenEditorControlProviders.css';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';

export interface ScreenEditorControlProvidersProps {
    environment: ScreenEditorEnvironment;
    children: ReactNode;
}

// What the native controls need from their host: the rich text editor's engine and the file upload's server policy. Both come
// from the environment the host lent, the same way for every host, and both leave the control inert until a person acts: nothing
// is loaded or requested for a screen that holds neither, and editing a screen never uploads anything.
export const ScreenEditorControlProviders = ({ environment, children }: ScreenEditorControlProvidersProps) => {
    const upload = (
        <FileUploadHandlerProvider handler={environment.fileUpload?.handler} allowedOrigins={environment.fileUpload?.allowedOrigins}>
            {children}
        </FileUploadHandlerProvider>
    );

    return environment.richText ? <QuillLoaderProvider loader={environment.richText}>{upload}</QuillLoaderProvider> : upload;
};
