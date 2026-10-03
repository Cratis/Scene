// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext, useMemo, useState } from 'react';
import { FileUpload, type FileUploadChangeEvent, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';
import { FileUploadHandler } from './FileUploadHandler';
import { FileUploadMode } from './FileUploadMode';

const HandlerContext = createContext<FileUploadHandler | undefined>(undefined);

export interface FileUploadHandlerProviderProps {
    /** The host-owned upload effect available to the enclosed Scene surface. */
    handler: FileUploadHandler;

    /** The surface whose file uploads the handler owns. */
    children: React.ReactNode;
}

/** Makes a host's upload effect available without coupling the Scene package to that host's server client. */
export function FileUploadHandlerProvider({ handler, children }: FileUploadHandlerProviderProps) {
    return <HandlerContext.Provider value={handler}>{children}</HandlerContext.Provider>;
}

/**
 * The `PrimeReact:fileUpload` component.
 *
 * PrimeReact 11 still provides a fully accessible file picker and drop zone. An authored `url` uses its
 * native XHR implementation; a host can instead provide {@link FileUploadHandlerProvider} and own the
 * server effect. The adapter never reaches into a Studio or application HTTP client itself.
 */
export function PrimeFileUpload({ element, interactions }: RegisteredComponentProps) {
    const handler = useContext(HandlerContext);
    const mode = fileUploadModeOf(element.properties.mode);
    const serverUrl = stringProperty(element, 'url');
    const [message, setMessage] = useState<string>();
    const canUpload = handler !== undefined || serverUrl !== undefined;
    const configuration = useMemo(() => ({
        accept: stringProperty(element, 'accept'),
        auto: (mode === FileUploadMode.Auto || mode === FileUploadMode.Basic) && canUpload,
        customUpload: handler !== undefined,
        disabled: !element.isEnabled,
        maxFileSize: numberProperty(element, 'maxFileSize'),
        multiple: booleanProperty(element, 'multiple', false),
        name: stringProperty(element, 'name', 'files'),
        url: serverUrl,
    }), [element, handler, mode, serverUrl, canUpload]);

    const uploaded = async (event: FileUploadHandlerEvent) => {
        if (handler === undefined) return;
        await handler(event.files, serverUrl);
        event.options.clear();
        setMessage(`${event.files.length} file${event.files.length === 1 ? '' : 's'} uploaded.`);
    };

    const changed = (event: FileUploadChangeEvent) => {
        interactions?.onChange?.();
        if (event.rejectedFiles.length > 0) setMessage('Some files do not meet the upload requirements.');
    };

    return (
        <div data-scene-id={element.id} onClick={interactions?.onClick} onDoubleClick={interactions?.onDoubleClick}>
            <FileUpload.Root
                {...configuration}
                uploadHandler={uploaded}
                onChange={changed}>
                <FileUpload.Content aria-label='File upload drop zone'>
                    <p>{mode === FileUploadMode.Basic ? 'Choose a file to upload.' : 'Drop files here or choose files to upload.'}</p>
                    <FileUpload.Trigger>{mode === FileUploadMode.Basic ? 'Choose file' : 'Choose files'}</FileUpload.Trigger>
                    {mode === FileUploadMode.Advanced && <FileUpload.Upload disabled={!canUpload}>Upload selected files</FileUpload.Upload>}
                    {!canUpload && <p role='status'>Configure a server URL or provide an upload handler to upload files.</p>}
                    {message !== undefined && <p role='status'>{message}</p>}
                </FileUpload.Content>
            </FileUpload.Root>
        </div>
    );
}

function fileUploadModeOf(value: unknown): FileUploadMode {
    if (value === 0 || value === FileUploadMode.Advanced) return FileUploadMode.Advanced;
    if (value === 1 || value === FileUploadMode.Basic) return FileUploadMode.Basic;
    if (value === 2 || value === FileUploadMode.Auto) return FileUploadMode.Auto;
    return FileUploadMode.Advanced;
}
