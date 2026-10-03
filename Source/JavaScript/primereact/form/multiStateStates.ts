// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '@cratis/scene.model';
import { MultiStateOption } from './MultiStateOption';

/**
 * Builds the ordered states a multi-state checkbox cycles through.
 *
 * With the empty state allowed, a state whose value is `null` comes first - unless an authored option
 * already has the value `null`, in which case that option *is* the empty state and keeps its authored
 * position, label and icon. Adding a second `null` state would leave two states with one value, and a
 * control that finds its place by value could then never move past the first of them.
 *
 * @param options The authored options, in order.
 * @param allowEmpty Whether a `null` state is available.
 * @param emptyLabel The label of the synthesized empty state.
 * @param emptyIcon The icon of the synthesized empty state.
 */
export function multiStateStates(options: MultiStateOption[], allowEmpty: boolean, emptyLabel: string, emptyIcon: string | IconReference | undefined): MultiStateOption[] {
    if (!allowEmpty || options.some(option => option.value === null)) return options;
    return [{ label: emptyLabel, value: null, ...(emptyIcon === undefined ? {} : { icon: emptyIcon }) }, ...options];
}
