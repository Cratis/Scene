// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import '../TemplatePicker/TemplatePicker.css';
import { useMemo, useRef, useState } from 'react';
import type { SampleDataCatalog } from '@cratis/scene.engine';
import { CascadeMenu } from '../CascadeMenu';
import { SampleDataPickerHandlers } from './SampleDataPickerHandlers';
import { SampleDataPickerLabels } from './SampleDataPickerLabels';
import { describeActiveSampleData, describeSampleDataPicker } from './describeSampleDataPicker';

export interface SampleDataPickerProps {
    /** Scene's description of what can be chosen. */
    catalog: SampleDataCatalog;

    /** The pack in effect, or empty for the generated data. */
    activePack: string;

    /** The labels to use. */
    labels: SampleDataPickerLabels;

    /** What choosing does. */
    handlers: SampleDataPickerHandlers;

    /** Whether the control can be used. */
    disabled?: boolean;

    /** A line to show before the value - the strip's `Sample data:`. Absent in the UI Profile setup, which has its own heading. */
    prefix?: string;
}

/**
 * The control that chooses the sample data pack: a select-shaped button showing what is in effect, which opens the same
 * {@link CascadeMenu} the template picker opens. The UI Profile setup chooses the application's pack with it, and the preview
 * strip chooses a session-only override with it - one control, two places, one source of truth (spec SD3).
 */
export const SampleDataPicker = ({ catalog, activePack, labels, handlers, disabled = false, prefix }: SampleDataPickerProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [anchor, setAnchor] = useState<DOMRect>();
    // The name of the button contains what it shows (WCAG 2.5.3): the action, then the pack in effect.
    const shown = `${prefix ? `${prefix} ` : ''}${describeActiveSampleData(catalog, activePack, labels)}`;
    const entries = useMemo(() => describeSampleDataPicker(catalog, '', labels, handlers), [catalog, labels, handlers]);

    return (
        <div className='studio-template-picker'>
            <button ref={buttonRef} type='button' className='studio-template-picker__select' aria-haspopup='menu' aria-expanded={anchor !== undefined}
                aria-label={`${labels.menu}: ${shown}`} disabled={disabled} onClick={() => setAnchor(previous => previous ? undefined : buttonRef.current?.getBoundingClientRect())}>
                <span className='studio-template-picker__value'>{shown}</span>
                <span className='studio-template-picker__caret' aria-hidden='true'>▾</span>
            </button>
            {anchor && <CascadeMenu anchor={anchor} trigger={buttonRef.current} entries={entries} label={labels.menu} onClose={() => setAnchor(undefined)} />}
        </div>
    );
};
