// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import './TemplatePicker.css';
import { useRef, useState } from 'react';
import type { ApplicableTemplateSet } from '@cratis/scene.engine';
import { TemplateReference } from '../ScreenTemplates/TemplateReference';
import { TemplatePickerHandlers } from './TemplatePickerHandlers';
import { TemplatePickerLabels } from './TemplatePickerLabels';
import { TemplatePickerMenu } from './TemplatePickerMenu';

export interface TemplatePickerProps {
    /** What applies at the target - Scene's `applicableTemplates`. */
    applicable: ApplicableTemplateSet;

    /** The template in effect, which gets the check. */
    current?: TemplateReference;

    /** What to show for it in the closed control. */
    currentLabel?: string;

    /** A line under the control, for example where an inherited template was chosen. */
    status?: string;

    /** The labels to use. */
    labels: TemplatePickerLabels;

    /** What choosing does. */
    handlers: TemplatePickerHandlers;

    /** The accessible name of the control. */
    ariaLabel: string;

    /** Whether the control can be used. */
    disabled?: boolean;
}

/**
 * The control that chooses a template: a select-shaped button showing what is in effect, which opens the one
 * {@link TemplatePickerMenu}. It is parameterised by the target alone - what applies comes from Scene - so every
 * place that applies a template uses this and none draws a menu of its own (spec TPL4).
 */
export const TemplatePicker = ({ applicable, current, currentLabel, status, labels, handlers, ariaLabel, disabled = false }: TemplatePickerProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [anchor, setAnchor] = useState<DOMRect>();

    return (
        <div className='studio-template-picker'>
            <button ref={buttonRef} type='button' className='studio-template-picker__select' aria-haspopup='menu' aria-expanded={anchor !== undefined}
                aria-label={ariaLabel} disabled={disabled}
                onClick={() => setAnchor(previous => previous ? undefined : buttonRef.current?.getBoundingClientRect())}>
                <span className='studio-template-picker__value'>{currentLabel ?? labels.noTemplate}</span>
                <span className='studio-template-picker__caret' aria-hidden='true'>▾</span>
            </button>
            {status && <span className='studio-template-picker__status'>{status}</span>}
            {anchor && <TemplatePickerMenu anchor={anchor} trigger={buttonRef.current} applicable={applicable} current={current}
                labels={labels} handlers={handlers} onClose={() => setAnchor(undefined)} />}
        </div>
    );
};
