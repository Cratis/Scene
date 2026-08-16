// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SelectOption } from '../SelectOption';

/**
 * Narrows the untyped item list a PrimeReact 11 headless list hook hands back into {@link SelectOption}s.
 *
 * The order list and pick list hooks are generic over their items but report changes as `unknown[]`,
 * because they only ever move entries around and never look inside one. The adapters fed them
 * `SelectOption`s and get the very same object references back, so this could have been a cast - but a
 * cast would also sail through if a future hook ever synthesized an entry, and the failure would surface
 * as a blank row rather than a missing one. Filtering on the shape keeps the untrusted boundary honest
 * for the cost of one pass over a list the user is looking at.
 *
 * @param values The entries as the hook reported them.
 * @returns The entries that are usable options, in order.
 */
export function toSelectOptions(values: unknown[]): SelectOption[] {
    return values.filter(
        (value): value is SelectOption =>
            typeof value === 'object' &&
            value !== null &&
            'label' in value &&
            typeof value.label === 'string' &&
            'value' in value &&
            typeof value.value === 'string'
    );
}
