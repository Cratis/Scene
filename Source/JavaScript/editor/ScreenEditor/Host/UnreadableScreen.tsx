// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocumentProblem } from '../Document/readSceneDocument';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import './ScreenEditorOverlay.css';

export interface UnreadableScreenProps {
    problem: SceneDocumentProblem;
    strings: ScreenEditorStrings;
    onClose?: () => void;
}

// Shown instead of the editor when a saved screen cannot be opened. Nothing is opened, nothing is converted and nothing is
// replaced: the stored document stays exactly as it is until it is repaired.
export const UnreadableScreen = ({ problem, strings, onClose }: UnreadableScreenProps) => (
    <div className='studio-screen-editor-unreadable' role='alertdialog' aria-label={strings.unreadable.title}>
        <strong>{strings.unreadable.title}</strong>
        <p>{strings.unreadable.reasons[problem]}</p>
        <p>{strings.unreadable.warning}</p>
        {onClose && (
            <div>
                <button type='button' onClick={onClose}>{strings.unreadable.close}</button>
            </div>
        )}
    </div>
);
