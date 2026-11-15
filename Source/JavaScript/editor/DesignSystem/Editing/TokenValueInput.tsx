// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import { TextInput } from '@cratis/components/Common';

export interface TokenValueInputProps {
    /** The value as stored. */
    value: string;

    /** What the value is - its accessible name. */
    label: string;

    /** Called with the new value when the person leaves the field or presses Enter on a changed value; answers why it could not be saved. */
    onCommit: (value: string) => Promise<string | undefined>;

    /** Stops the value being changed while a save is in flight. */
    disabled?: boolean;
}

/**
 * A token's value, edited in place and saved when the field is left - one saved change per edit, not per key. A value that is
 * refused is said so beside the field and stays as typed, so the person can correct it.
 */
export const TokenValueInput = ({ value, label, onCommit, disabled }: TokenValueInputProps) => {
    const [text, setText] = useState(value);
    const [error, setError] = useState<string | undefined>();
    useEffect(() => setText(value), [value]);

    const commit = async () => {
        if (text.trim() === '' || text === value) {
            setText(value);
            setError(undefined);
            return;
        }
        setError(await onCommit(text));
    };

    return (
        <span className='studio-design-system__value-input'>
            <TextInput
                value={text}
                onChange={setText}
                onBlur={() => void commit()}
                onKeyDown={event => { if (event.key === 'Enter') void commit(); }}
                aria-label={label}
                invalid={error !== undefined}
                disabled={disabled}
                className='studio-design-system__value-field' />
            {error !== undefined && <span role='alert' className='studio-design-system__error'>{error}</span>}
        </span>
    );
};
