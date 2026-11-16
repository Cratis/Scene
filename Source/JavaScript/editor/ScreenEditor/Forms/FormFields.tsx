// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import './FormFields.css';
import type { CSSProperties } from 'react';
import { formFieldGridOf } from './formFieldGrid';

export interface FormFieldView {
    name: string;
    label: string;
    required?: boolean;
    type?: 'text' | 'number' | 'date' | 'checkbox';
    value?: string | boolean;
}

export interface FormFieldsProps {
    fields: readonly FormFieldView[];
    layout?: unknown;

    // At design time the fields show their sample values and take no input.
    readOnly?: boolean;
}

// The fields of a command form on the grid the form's layout declares - the one drawing the screen editor and the preview share.
export const FormFields = ({ fields, layout, readOnly = false }: FormFieldsProps) => {
    const grid = formFieldGridOf(layout);
    const style: CSSProperties = { gridTemplateColumns: grid.columns, ...(grid.gap ? { columnGap: grid.gap } : {}) };
    return (
        <div className='studio-form-fields' style={style} data-form-fields=''>
            {fields.map(field => {
                const placement = grid.placements[field.name] ?? {};
                const label = `${field.label}${field.required ? ' *' : ''}`;
                return field.type === 'checkbox'
                    ? <label key={field.name} className='studio-form-fields__field studio-form-fields__field--checkbox' style={placement}>
                        <input type='checkbox' name={field.name} defaultChecked={field.value === true} disabled={readOnly} /> {label}
                    </label>
                    : <label key={field.name} className='studio-form-fields__field' style={placement}>
                        <span>{label}</span>
                        <input type={field.type ?? 'text'} name={field.name} readOnly={readOnly} tabIndex={readOnly ? -1 : undefined}
                            defaultValue={field.value === undefined ? '' : String(field.value)} />
                    </label>;
            })}
        </div>
    );
};
