// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { ActionButton } from './ActionButton';
import { ComponentState, readComponentState } from './ComponentState';
import { useFileUploaderHandler } from './FileUploaderHandler';
import { FoundationIcon } from './FoundationIcon';
import { readLocale } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import { FoundationFrame } from './StateFrame';
import { UploadRefusal, UploadStatus, checkSelection, formatBytes } from './uploadModel';

interface Entry {
    file: File;
    status: UploadStatus;
}

/**
 * The `fileUploader` component: a drop zone and a button to choose files, checked against type and size before anything is sent.
 *
 * `accept` is an `accept` list, `maxSizeMb` the largest file, and `multiple` whether more than one is allowed. The zone is a real file
 * input behind a labelled button, so it works from the keyboard and with a screen reader; dropping onto it does the same as choosing.
 * Refusals are announced with their reason. Accepted files are listed with a remove button and a status in words; the selection
 * (name, size, type) is published as the `value` output. With a `FileUploaderHandlerProvider` in scope the files are sent through it and
 * marked uploading, done or failed; without one the component only collects. `actionPermission` gates choosing files.
 */
export function FileUploader({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const handler = useFileUploaderHandler();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [problems, setProblems] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const accept = readOptionalString(element, 'accept') ?? '';
    const maximumBytes = (typeof element.properties.maxSizeMb === 'number' ? element.properties.maxSizeMb : 0) * 1024 * 1024;
    const multiple = element.properties.multiple !== false;
    const rule = readPermissionRule(element, 'actionPermission');
    const state = readComponentState(element, true);
    const serverUrl = readOptionalString(element, 'serverUrl');

    useValueOutput(bindingOutputs, entries.map(entry => ({ name: entry.file.name, size: entry.file.size, type: entry.file.type, status: entry.status })));

    const send = async (files: File[]) => {
        if (!handler) return;
        const mark = (status: UploadStatus) => setEntries(current => current.map(entry => (files.includes(entry.file) ? { ...entry, status } : entry)));
        mark(UploadStatus.Uploading);
        try {
            await handler(files, serverUrl);
            mark(UploadStatus.Done);
        } catch {
            mark(UploadStatus.Failed);
        }
    };

    const take = (chosen: File[]) => {
        const { accepted, refused } = checkSelection(chosen, { accept, maximumBytes, multiple }, entries.length);
        setProblems(refused.map(({ file, reason }) => reason === UploadRefusal.WrongType ? formatText(strings.uploadWrongType, { name: file.name })
            : reason === UploadRefusal.TooLarge ? formatText(strings.uploadTooLarge, { name: file.name, limit: formatBytes(maximumBytes, locale) }) : strings.uploadSingle));
        if (accepted.length === 0) return;

        setEntries(current => [...current, ...accepted.map(file => ({ file, status: UploadStatus.Queued }))]);
        interactions?.onChange?.();
        void send(accepted);
    };

    const choose = (event: ChangeEvent<HTMLInputElement>) => {
        take(Array.from(event.target.files ?? []));
        event.target.value = '';
    };
    const drop = (event: DragEvent) => {
        event.preventDefault();
        setDragging(false);
        if (rule === 'enabled') take(Array.from(event.dataTransfer.files));
    };
    const statusText: Record<UploadStatus, string> = {
        queued: strings.uploadQueued, uploading: strings.uploadUploading, done: strings.uploadDone, failed: strings.uploadFailed,
    };
    const limits = [accept ? formatText(strings.uploadAccepts, { types: accept }) : '', maximumBytes > 0 ? formatText(strings.uploadLimits, { limit: formatBytes(maximumBytes, locale) }) : ''].filter(Boolean).join(' · ');

    return (
        <FoundationFrame element={element} interactions={interactions} name='file-uploader' state={state} skeleton={[100, 40]}>
            {state !== ComponentState.Loading && (
                <>
                    <div className='foundation-dropzone' data-dragging={dragging} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
                        <FoundationIcon name='upload' />
                        <span>{strings.uploadDrop}</span>
                        <input ref={input} className='foundation-visually-hidden' type='file' tabIndex={-1} accept={accept || undefined} multiple={multiple} disabled={rule !== 'enabled'} onChange={choose} aria-hidden='true' />
                        <ActionButton rule={rule} emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={() => input.current?.click()}>
                            {strings.uploadBrowse}
                        </ActionButton>
                        {limits && <span className='foundation-count'>{limits}</span>}
                    </div>
                    <div aria-live='polite' className='foundation-upload-problems'>
                        {problems.map(problem => <p key={problem} className='foundation-message-text' data-tone='danger'>{problem}</p>)}
                    </div>
                    {entries.length > 0 && (
                        <ul className='foundation-upload-list' aria-label={strings.uploadSelected}>
                            {entries.map((entry, index) => (
                                <li key={entry.file.name + index} className='foundation-upload-item' data-status={entry.status}>
                                    <FoundationIcon name='file' />
                                    <span className='foundation-upload-name'>{entry.file.name}</span>
                                    <span className='foundation-count'>{formatBytes(entry.file.size, locale)}</span>
                                    <span className='foundation-upload-status'>{statusText[entry.status]}</span>
                                    {entry.status === UploadStatus.Failed && <button type='button' className='foundation-link' onClick={() => void send([entry.file])}>{strings.retry}</button>}
                                    <button type='button' className='foundation-icon-button' aria-label={formatText(strings.uploadRemove, { name: entry.file.name })}
                                        onClick={() => { setEntries(current => current.filter(existing => existing !== entry)); interactions?.onChange?.(); }}>
                                        <FoundationIcon name='close' />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </FoundationFrame>
    );
}
