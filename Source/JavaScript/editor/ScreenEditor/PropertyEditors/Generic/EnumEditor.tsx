// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { choiceKey, choiceOptions } from '../../Properties/choiceKeys';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// An enumeration of up to four choices as chips (spec 8.1): the chosen one has a blue border and a pale-blue fill. Choosing it again
// puts the property back to its default, unless it is required. The choice's own typed value is stored, so a number stays a number.
export const EnumEditor = ({ value, onChange, descriptor, disabled, id }: PropertyEditorProps<unknown>) => {
    const stored = value ?? undefined;
    const options = choiceOptions(descriptor.choices ?? [], stored);
    const required = descriptor.constraints?.required === true;

    return (
        <div id={id} role='radiogroup' aria-labelledby={`${id}-label`} className='studio-editor-chips'>
            {options.map(option => {
                const chosen = stored !== undefined && option.key === choiceKey(stored);
                return (
                    <button
                        key={option.key} type='button' role='radio' aria-checked={chosen} disabled={disabled}
                        className={`studio-editor-chip${chosen ? ' studio-editor-chip--chosen' : ''}`}
                        onClick={() => onChange(chosen && !required ? undefined : option.value)}>
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
