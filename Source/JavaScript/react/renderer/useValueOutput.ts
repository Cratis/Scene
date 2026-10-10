// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef } from 'react';
import { ComponentBindingOutputs } from './BindingOutputContext';

/** The output property an input widget publishes its current value under. */
export const valueOutputName = 'value';

/**
 * Publishes an input widget's current value as its `value` output: once when it mounts, with the initial
 * value, and again on every change. Other elements bind to it with a `componentProperty` binding, and a
 * command action maps it as `component.<id>.value`. The renderer clears the output when the widget unmounts.
 *
 * Values are published as JSON-compatible data so both engines read the same thing: a `Date` is published
 * as its ISO 8601 string, and `undefined` as `null`.
 */
export function useValueOutput(bindingOutputs: ComponentBindingOutputs | undefined, value: unknown): void {
    const published = value instanceof Date ? value.toISOString() : value ?? null;
    const key = JSON.stringify(published);
    const latest = useRef(published);
    latest.current = published;

    // Published by value through `key`: a new array or object with the same content is not a change.
    useEffect(() => {
        bindingOutputs?.setOutput(valueOutputName, latest.current);
    }, [bindingOutputs, key]);
}
