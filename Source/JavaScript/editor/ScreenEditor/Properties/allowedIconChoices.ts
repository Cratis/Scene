// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { IconPickerAllowed } from '@cratis/components/IconPicker';
import { parseIconReference, type PropertyChoice } from '@cratis/scene.model';

// Turns descriptor choices into the qualified values an IconPropertyField accepts. A descriptor without icon choices leaves
// the picker unrestricted; malformed choices remain Scene validation errors rather than becoming a guessed identity.
export function allowedIconChoices(choices: PropertyChoice[] | undefined): IconPickerAllowed | undefined {
    if (choices === undefined) return undefined;
    return choices
        .filter(choice => typeof choice.value === 'string')
        .map(choice => parseIconReference(choice.value as string))
        .filter((choice): choice is NonNullable<typeof choice> => choice !== undefined);
}
