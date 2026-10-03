// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ChangeEvent, DragEvent, useContext, useMemo, useSyncExternalStore } from 'react';
import { FileUpload, type FileUploadChangeEvent, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';
import { resolveEnumeration } from '../resolveEnumeration';
import { FileUploadContext } from './FileUploadContext';
import { FileUploadMode } from './FileUploadMode';
import { resolveUploadTarget } from './resolveUploadTarget';
import { useUploadSession } from './useUploadSession';

const subscribeToNothing = () => () => undefined;
const pageOrigin = () => window.location.origin;
const noPageOrigin = () => undefined;

/**
 * The `PrimeReact:fileUpload` component.
 *
 * PrimeReact 11 provides the accessible file picker and drop zone; this adapter owns everything that has an
 * effect or a policy:
 * - The authored `url` is untrusted data. It is checked by {@link resolveUploadTarget} - same origin as the
 *   page unless the host allows more through {@link FileUploadHandlerProvider} - and a refused address is
 *   reported and blocks every upload, the host's handler included.
 * - Nothing is requested on mount. A request starts only when the user selects or drops files (automatic and
 *   basic mode) or presses the upload button.
 * - `multiple: false` is enforced before anything is sent, for the file input and for drag and drop.
 * - One upload runs at a time (nothing can be selected or dropped while it runs), and a failure is shown
 *   rather than thrown.
 * - A disabled element (`isEnabled: false`) disables the picker, the upload button and the drop zone.
 *
 * Without a host handler the control posts the files itself with `fetch`, sending cookies to the page's own
 * origin only.
 */
export function PrimeFileUpload({ element, interactions }: RegisteredComponentProps) {
    const { handler, allowedOrigins } = useContext(FileUploadContext);
    const origin = useSyncExternalStore(subscribeToNothing, pageOrigin, noPageOrigin);
    const modeResolution = resolveEnumeration('mode', element.properties.mode, FileUploadMode, FileUploadMode.Advanced);
    const mode = modeResolution.isValid ? modeResolution.value : FileUploadMode.Advanced;
    const authoredUrl = stringProperty(element, 'url');
    const target = useMemo(() => resolveUploadTarget(authoredUrl, origin, allowedOrigins), [authoredUrl, origin, allowedOrigins]);
    const serverUrl = target.isValid ? target.url : undefined;
    const multiple = booleanProperty(element, 'multiple', false);
    const enabled = element.isEnabled;
    const canUpload = target.isValid && (handler !== undefined || serverUrl !== undefined);
    const session = useUploadSession(handler, serverUrl, stringProperty(element, 'name', 'files'));

    const uploaded = async (event: FileUploadHandlerEvent) => {
        if (!enabled || !canUpload) return;
        if (await session.upload(event.files)) event.options.clear();
    };

    const changed = (event: FileUploadChangeEvent) => {
        // Clearing the selection after an upload reports an empty change; it is not a new selection, and must not
        // wipe the result of the upload that caused it.
        if (event.acceptedFiles.length === 0 && event.rejectedFiles.length === 0) return;
        const rejection = event.rejectedFiles.flatMap(rejected => rejected.errors.map(error => error.message)).join(' ');
        session.setStatus(rejection === '' ? undefined : { kind: 'error', text: rejection });
        interactions?.onChange?.();
    };

    const refuseSeveralFromInput = (event: ChangeEvent<HTMLElement>) => {
        const input = event.target as HTMLInputElement;
        if (input.type !== 'file') return;
        if (session.busy) {
            event.stopPropagation();
            input.value = '';
            return;
        }

        if (multiple || (input.files?.length ?? 0) < 2) return;
        event.stopPropagation();
        input.value = '';
        session.setStatus({ kind: 'error', text: 'Only one file can be uploaded at a time.' });
    };

    const refuseDrop = (event: DragEvent<HTMLElement>) => {
        if (!enabled) {
            event.preventDefault();
            return;
        }
        if (session.busy) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (multiple || (event.dataTransfer?.files.length ?? 0) < 2) return;
        event.preventDefault();
        event.stopPropagation();
        session.setStatus({ kind: 'error', text: 'Only one file can be uploaded at a time.' });
    };

    return (
        <div
            data-scene-id={element.id}
            data-scene-component='fileUpload'
            onClick={interactions?.onClick}
            onDoubleClick={interactions?.onDoubleClick}
            onChangeCapture={refuseSeveralFromInput}
            onDropCapture={refuseDrop}
            onDragOverCapture={event => { if (!enabled) event.preventDefault(); }}>
            <FileUpload.Root
                accept={stringProperty(element, 'accept')}
                auto={(mode === FileUploadMode.Auto || mode === FileUploadMode.Basic) && canUpload}
                customUpload
                disabled={!enabled}
                maxFileSize={numberProperty(element, 'maxFileSize')}
                multiple={multiple}
                name={stringProperty(element, 'name', 'files')}
                uploadHandler={uploaded}
                onChange={changed}>
                <FileUpload.Content aria-label={stringProperty(element, 'ariaLabel', 'File upload drop zone')}>
                    <p>{mode === FileUploadMode.Basic ? 'Choose a file to upload.' : 'Drop files here or choose files to upload.'}</p>
                    <FileUpload.Trigger disabled={!enabled || session.busy}>{mode === FileUploadMode.Basic ? 'Choose file' : 'Choose files'}</FileUpload.Trigger>
                    {mode === FileUploadMode.Advanced && (
                        <FileUpload.Upload disabled={!enabled || !canUpload || session.busy}>Upload selected files</FileUpload.Upload>
                    )}
                    {!modeResolution.isValid && <p role='alert' data-scene-state='unsupported-mode'>{modeResolution.message}</p>}
                    {!target.isValid && <p role='alert' data-scene-state='refused-address'>{target.message}</p>}
                    {target.isValid && !canUpload && <p role='status'>Configure a server URL or provide an upload handler to upload files.</p>}
                    {session.busy && <p role='status'>Uploading…</p>}
                    {session.status !== undefined && <p role={session.status.kind === 'error' ? 'alert' : 'status'}>{session.status.text}</p>}
                </FileUpload.Content>
            </FileUpload.Root>
        </div>
    );
}
