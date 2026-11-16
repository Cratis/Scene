// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// A switch. `undefined` - never set - reads as the descriptor's default, and turning it on or off stores the choice.
export const BooleanEditor = ({ value, onChange, descriptor, disabled, id }: PropertyEditorProps<boolean>) => {
    const on = typeof value === 'boolean' ? value : descriptor.default === true;
    return (
        <button type='button' id={id} role='switch' aria-checked={on} disabled={disabled} className={`studio-editor-switch${on ? ' studio-editor-switch--on' : ''}`} onClick={() => onChange(!on)}>
            <span className='studio-editor-switch__thumb' />
        </button>
    );
};
