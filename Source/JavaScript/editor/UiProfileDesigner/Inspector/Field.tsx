// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';

export interface FieldProps {
    /** The field's label. */
    label: string;

    /** The id of the control the label is for; when absent the label names a group of controls. */
    htmlFor?: string;

    /** The line under the control. */
    hint?: string;

    children: ReactNode;
}

/** One labelled control of the inspector, with the hint under it. */
export const Field = ({ label, htmlFor, hint, children }: FieldProps) => (
    <div className='studio-inspector-field'>
        {htmlFor === undefined ? <span className='studio-inspector-field__label'>{label}</span> : <label className='studio-inspector-field__label' htmlFor={htmlFor}>{label}</label>}
        {children}
        {hint !== undefined && <p className='studio-inspector-field__hint'>{hint}</p>}
    </div>
);

export interface SegmentedProps<T extends string> {
    /** Names the group for assistive technology. */
    label: string;
    value: T | undefined;
    options: readonly { value: T; label: string }[];
    onChange: (value: T) => void;
}

/** A group of mutually exclusive choices, drawn as a row of buttons. */
export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
    return (
        <div className='studio-inspector-segmented' role='radiogroup' aria-label={label}>
            {options.map(option => (
                <button key={option.value} type='button' role='radio' aria-checked={option.value === value} data-selected={option.value === value} onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    );
}
