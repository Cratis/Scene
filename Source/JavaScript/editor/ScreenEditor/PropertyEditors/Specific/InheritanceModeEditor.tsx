// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

type Mode = 'inherit' | 'extend' | 'override';
const modes: readonly Mode[] = ['inherit', 'extend', 'override'];

// How a region relates to the one above it (spec 8.2): a three-way segmented control with a line saying what the chosen mode does.
// Moving from inherit to override asks "Copy application items?" - copying is the default - and reports the answer to the session, which
// copies the inherited items through the engine as part of the same edit. A region with no stored mode inherits.
export const InheritanceModeEditor = ({ value, onChange, context, disabled, id }: PropertyEditorProps<Mode>) => {
    const text = context.strings.editors.inheritanceMode;
    const current: Mode = value !== undefined && modes.includes(value) ? value : 'inherit';
    const [asking, setAsking] = useState(false);

    const choose = (mode: Mode) => {
        if (mode === current) return;
        if (current === 'inherit' && mode === 'override') { setAsking(true); return; }
        setAsking(false);
        onChange(mode);
    };
    const confirm = (copy: boolean) => {
        setAsking(false);
        onChange('override');
        context.session?.copyInheritedItems?.(copy);
    };

    return (
        <div id={id} className='studio-editor-mode'>
            <div className='studio-editor-segments' role='radiogroup' aria-labelledby={`${id}-label`}>
                {modes.map(mode => (
                    <button
                        key={mode} type='button' role='radio' aria-checked={mode === current} disabled={disabled}
                        className={`studio-editor-segment${mode === current ? ' studio-editor-segment--chosen' : ''}`} onClick={() => choose(mode)}>
                        {text.modes[mode].label}
                    </button>
                ))}
            </div>
            <p className='studio-editor-properties__hint'>{text.modes[current].effect}</p>
            {asking && (
                <div className='studio-editor-mode__prompt' role='alertdialog' aria-label={text.copyPrompt}>
                    <span>{text.copyPrompt}</span>
                    <button type='button' autoFocus onClick={() => confirm(true)}>{text.copyYes}</button>
                    <button type='button' onClick={() => confirm(false)}>{text.copyNo}</button>
                </div>
            )}
        </div>
    );
};
