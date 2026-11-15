// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerAllowed, IconPickerCatalog, isIconPickerAllowed, isSameIconPickerValue } from '@cratis/components/IconPicker';
import { EffectiveIconCatalog } from '@cratis/scene.engine';
import { IconReference } from '@cratis/scene.model';
import { IconValueProblem } from './IconValueProblem';

// Says what is wrong with the icon a field holds, without ever changing it.
//
// A reference the effective catalog cannot supply - its library removed from the profile, the icon or
// variant gone, a library at an incompatible version, or a catalog that could not be read - is reported
// with Scene's own diagnostic so the user can repair it deliberately. An icon that resolves but is outside
// what the field allows is reported separately. A library whose catalog has not loaded yet is not a
// problem: nothing can be said about it until it has.
export function diagnoseIconValue(
    catalog: EffectiveIconCatalog,
    offered: IconPickerCatalog,
    value: IconReference | null | undefined,
    allowed?: IconPickerAllowed,
): IconValueProblem | undefined {
    if (!value) return undefined;
    const resolution = catalog.lookup(value);
    if (!resolution) return undefined;
    if (!resolution.isResolved) return { reference: value, diagnostic: resolution.diagnostic, isNotAllowed: false };

    const entry = offered.icons.find(candidate => isSameIconPickerValue(candidate, value));
    return entry && allowed && !isIconPickerAllowed(entry, allowed) ? { reference: value, isNotAllowed: true } : undefined;
}
