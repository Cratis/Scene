// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

// A colour: the theme's tokens first - the stored value is the token's name, so the colour follows the theme - then a custom colour, stored
// as hex. `tokensOnly` leaves the custom colour out.
export const ColorEditor = ({ value, onChange, descriptor, context, disabled, id }: PropertyEditorProps<string>) => {
    const text = context.strings.editors.color;
    const tokens = context.lookups.colorTokens;
    const stored = typeof value === 'string' ? value : undefined;
    const isCustom = stored !== undefined && !tokens.some(token => token.name === stored);
    const swatch = hex.test(stored ?? '') ? stored : '#000000';

    return (
        <div id={id} className='studio-editor-color' role='group' aria-labelledby={`${id}-label`}>
            {tokens.length > 0 && (
                <div className='studio-editor-color__tokens' role='radiogroup' aria-label={text.tokens}>
                    {tokens.map(token => (
                        <button
                            key={token.name} type='button' role='radio' aria-checked={stored === token.name} aria-label={token.label} title={token.label} disabled={disabled}
                            className={`studio-editor-color__swatch${stored === token.name ? ' studio-editor-color__swatch--chosen' : ''}`}
                            style={token.value ? { background: token.value } : undefined}
                            onClick={() => onChange(stored === token.name ? undefined : token.name)} />
                    ))}
                </div>
            )}
            {descriptor.editorOptions?.tokensOnly !== true && (
                <div className='studio-editor-color__custom'>
                    <input type='color' aria-label={text.custom} disabled={disabled} value={swatch} onChange={event => onChange(event.target.value)} />
                    <input
                        type='text' aria-label={text.hex} placeholder='#rrggbb' disabled={disabled} className='studio-editor-field__input' defaultValue={isCustom ? stored : ''} key={stored ?? ''}
                        onBlur={event => { const next = event.target.value.trim(); if (next === '') { if (isCustom) onChange(undefined); } else if (hex.test(next)) onChange(next); }} />
                </div>
            )}
        </div>
    );
};
