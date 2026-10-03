// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, useId, useState } from 'react';
import { isIconReference } from '@cratis/scene.model';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';
import { MultiStateGlyph } from './MultiStateGlyph';
import { multiStateOptions } from './multiStateOptions';
import { multiStateStates } from './multiStateStates';
import { useMultiStateSelection } from './useMultiStateSelection';

const visuallyHidden: CSSProperties = {
    position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

/**
 * The `PrimeReact:multiStateCheckbox` component.
 *
 * PrimeReact 11 removed MultiStateCheckbox, so Scene renders its original behavior with a native button.
 * It cycles through the authored states in order, including the optional empty (`null`) state, and keeps
 * option values and icons exactly as the element carries them. Each click moves one step; the position is
 * an index, so duplicated or `null` option values do not make later states unreachable.
 *
 * Accessibility: a state cycle is not a true/false choice, so the control does not claim `checkbox`
 * semantics (every non-empty state would announce as "checked"). It is a button whose name is the authored
 * `ariaLabel`, whose description is the current state, and whose state changes are announced through a
 * polite live region. `readOnly` keeps the control focusable and unchanged; `disabled` removes it from the
 * tab order.
 *
 * The control follows the document: a changed `value` or `options` restarts the cycle from the new value,
 * so an inspector edit is reflected immediately. It does not report its own selection to behaviors -
 * Scene's interaction handlers carry no value.
 */
export function PrimeMultiStateCheckbox({ element, interactions }: RegisteredComponentProps) {
    const stateId = useId();
    const allowEmpty = booleanProperty(element, 'empty', true);
    const emptyLabel = stringProperty(element, 'emptyLabel', 'No selection');
    const emptyIcon = element.properties.emptyIcon;
    const states = multiStateStates(
        multiStateOptions(element, emptyLabel),
        allowEmpty,
        emptyLabel,
        typeof emptyIcon === 'string' || isIconReference(emptyIcon) ? emptyIcon : undefined);
    const authored = element.properties.value;
    const { index, advance } = useMultiStateSelection(states, authored === undefined && allowEmpty ? null : authored);
    const [focused, setFocused] = useState(false);

    const selected = states[index];
    const readOnly = booleanProperty(element, 'readOnly', false);
    const disabled = !element.isEnabled || booleanProperty(element, 'disabled', false) || states.length === 0;
    const ariaLabel = stringProperty(element, 'ariaLabel', element.name || 'Multi-state checkbox');
    const stateText = selected?.label ?? stringProperty(element, 'placeholder', unmatchedText(states.length, authored, emptyLabel));

    return (
        <>
            <button
                type='button'
                data-scene-id={element.id}
                data-scene-component='multiStateCheckbox'
                data-scene-state-index={index}
                aria-label={ariaLabel}
                aria-describedby={stateId}
                aria-disabled={readOnly ? true : undefined}
                disabled={disabled}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: 0, border: 0, background: 'none', font: 'inherit',
                    color: 'inherit', cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
                    outline: focused ? 'var(--p-focus-ring-width, 2px) var(--p-focus-ring-style, solid) var(--p-focus-ring-color, currentColor)' : 'none',
                    outlineOffset: 'var(--p-focus-ring-offset, 2px)',
                }}
                onFocus={(event) => setFocused(isFocusVisible(event.currentTarget))}
                onBlur={() => setFocused(false)}
                onClick={(event) => {
                    if (!readOnly) advance();
                    interactions?.onClick?.(event);
                    if (readOnly) return;
                    interactions?.onChange?.();
                    interactions?.onSelect?.();
                }}
                onDoubleClick={interactions?.onDoubleClick}>
                <MultiStateGlyph state={selected} isEmpty={selected === undefined || selected.value === null} isInactive={disabled || readOnly} />
                <span aria-hidden='true'>{stateText}</span>
            </button>
            <span id={stateId} role='status' style={visuallyHidden}>{stateText}</span>
        </>
    );
}

function unmatchedText(stateCount: number, authored: unknown, emptyLabel: string): string {
    if (stateCount === 0) return 'No states';
    return authored === undefined ? emptyLabel : 'No matching state';
}

function isFocusVisible(target: HTMLElement): boolean {
    try {
        return target.matches(':focus-visible');
    } catch {
        return true;
    }
}
