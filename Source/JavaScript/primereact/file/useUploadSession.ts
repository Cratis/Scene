// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileUploadHandler } from './FileUploadHandler';
import { UploadStatus } from './UploadStatus';
import { postFiles } from './postFiles';

/** The state of the upload in flight, if any, and the action that starts one. */
export interface UploadSession {
    /** Whether an upload is running. */
    busy: boolean;

    /** The last result, or `undefined` before the first upload and after a new selection. */
    status: UploadStatus | undefined;
    setStatus(status: UploadStatus | undefined): void;

    /**
     * Sends the files, unless an upload is already running.
     *
     * @returns Whether the files were sent, so the caller knows to clear its selection. A failure is reported
     * through `status` and returns `false`: the selection stays so it can be retried.
     */
    upload(files: File[]): Promise<boolean>;
}

/**
 * Runs one upload at a time for a control, through the host's handler or a POST to the checked address.
 *
 * Starting an upload while one runs is ignored rather than queued, so a double click cannot send the same
 * files twice. Every failure ends in a visible `status`; none escapes as an unhandled rejection. An upload
 * still running when the control unmounts is cancelled.
 *
 * @param handler The host's upload effect, if it owns the effect.
 * @param url The checked address, if one was authored.
 * @param field The multipart field name used when the control posts the files itself.
 */
export function useUploadSession(handler: FileUploadHandler | undefined, url: string | undefined, field: string): UploadSession {
    const running = useRef<AbortController | undefined>(undefined);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<UploadStatus | undefined>(undefined);

    useEffect(() => () => running.current?.abort(), []);

    const upload = useCallback(async (files: File[]): Promise<boolean> => {
        if (running.current !== undefined) return false;
        const controller = new AbortController();
        running.current = controller;
        setBusy(true);
        setStatus(undefined);
        try {
            if (handler !== undefined) await handler(files, url);
            else if (url !== undefined) await postFiles(url, field, files, controller.signal);
            else throw new Error('There is nowhere to send the files.');
            setStatus({ kind: 'success', text: `${files.length} file${files.length === 1 ? '' : 's'} uploaded.` });
            return true;
        } catch (error) {
            if (!controller.signal.aborted) setStatus({ kind: 'error', text: `Upload failed: ${error instanceof Error ? error.message : String(error)}` });
            return false;
        } finally {
            running.current = undefined;
            setBusy(false);
        }
    }, [handler, url, field]);

    return { busy, status, setStatus, upload };
}
