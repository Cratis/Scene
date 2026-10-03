// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { structurallyEqual } from './structurallyEqual';

/**
 * Returns the same reference for as long as the content of `value` is unchanged.
 *
 * Use it for authored data that feeds an effect dependency list: a cloned document gives that data a new
 * identity on every unrelated edit, which would otherwise rerun the effect and rebuild whatever it owns.
 */
export function useStructuralValue<TValue>(value: TValue): TValue {
    const stable = useRef(value);
    if (!structurallyEqual(stable.current, value)) stable.current = value;
    return stable.current;
}
