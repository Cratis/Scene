// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';
import { multiStateOptions } from './multiStateOptions';
import { multiStateValueEquals } from './multiStateValueEquals';

/**
 * The `PrimeReact:multiStateCheckbox` component.
 *
 * PrimeReact 11 removed MultiStateCheckbox, so Scene renders its original behavior with a native,
 * keyboard-operable checkbox button. It cycles through the authored states in order, including the
 * optional null state, while retaining values and icons exactly as the element carries them.
 */
export function PrimeMultiStateCheckbox({ element, interactions }: RegisteredComponentProps) {
    const options = multiStateOptions(element);
    const empty = booleanProperty(element, 'empty', true);
    const states = empty
        ? [{ label: stringProperty(element, 'emptyLabel', 'No selection'), value: null }, ...options]
        : options;
    const [value, setValue] = useState<unknown>(element.properties.value === undefined && empty ? null : element.properties.value);
    const selected = states.find(option => multiStateValueEquals(option.value, value));
    const disabled = !element.isEnabled || booleanProperty(element, 'disabled', false) || states.length === 0;
    const ariaLabel = stringProperty(element, 'ariaLabel', element.name || 'Multi-state checkbox');

    const advance = () => {
        const index = states.findIndex(option => multiStateValueEquals(option.value, value));
        setValue(states[(index + 1) % states.length]?.value);
    };

    return (
        <button
            type='button'
            role='checkbox'
            data-scene-id={element.id}
            data-scene-component='multiStateCheckbox'
            aria-checked={value === null ? 'mixed' : value !== undefined}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={(event) => {
                advance();
                interactions?.onClick?.(event);
                interactions?.onChange?.();
                interactions?.onSelect?.();
            }}
            onDoubleClick={interactions?.onDoubleClick}>
            {selected?.icon !== undefined && <i className={selected.icon} aria-hidden='true' />}
            <span>{selected?.label ?? stringProperty(element, 'placeholder', 'No states')}</span>
        </button>
    );
}
