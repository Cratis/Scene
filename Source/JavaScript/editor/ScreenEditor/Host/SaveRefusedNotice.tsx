// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import './ScreenEditorOverlay.css';

export interface SaveRefusedNoticeProps {
    strings: Pick<ScreenEditorStrings, 'saveRefused' | 'keepEditing' | 'discardAndClose'>;
    message: string;
    onKeepEditing?: () => void;
    onDiscard?: () => void;
}

// A refused save never traps the person: besides what is wrong, they can carry on editing or give the changes up and leave.
export const SaveRefusedNotice = ({ strings, message, onKeepEditing, onDiscard }: SaveRefusedNoticeProps) => (
    <div className='studio-screen-editor-window__notice' role='alert'>
        <p><strong>{strings.saveRefused}</strong> {message}</p>
        {(onKeepEditing || onDiscard) && (
            <div className='studio-screen-editor-window__notice-actions'>
                {onKeepEditing && <button type='button' onClick={onKeepEditing}>{strings.keepEditing}</button>}
                {onDiscard && <button type='button' onClick={onDiscard}>{strings.discardAndClose}</button>}
            </div>
        )}
    </div>
);
