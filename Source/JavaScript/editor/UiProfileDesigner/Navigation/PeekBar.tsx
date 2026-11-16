// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import './CanvasNavigation.css';

export interface PeekBarProps {
    // What is being peeked at, by name.
    name: string;
    strings: UiProfileDesignerStrings['navigation'];
    onBack(): void;

    // Absent where there is nothing to open the destination in.
    onOpenInEditor?(): void;
}

// The slim bar over a peek (spec N2): the content slot shows a destination the author clicked to, read-only; Back returns to what was chosen.
export const PeekBar = ({ name, strings, onBack, onOpenInEditor }: PeekBarProps) => (
    <div className='studio-uiprofile-peek' role='status' aria-label={strings.peeking.replace('{name}', name)} data-peek={name}>
        <span className='studio-uiprofile-peek__text'>{strings.peeking.replace('{name}', name)}</span>
        {onOpenInEditor && <button type='button' className='studio-uiprofile-peek__action' onClick={onOpenInEditor}>{strings.openInEditor}</button>}
        <button type='button' className='studio-uiprofile-peek__action' onClick={onBack}>{strings.back}</button>
    </div>
);
