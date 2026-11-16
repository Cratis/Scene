// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty } from '@cratis/scene.model';
import type { DesignModeStrings } from '../DesignMode/DesignModeStrings';

// Scene's descriptor names a button's `display` and its choices in English. The Properties tab says them in the editor's own words, so the
// field's accessible name and each choice can be localized; a choice the strings do not know keeps Scene's label.
export function localizedDisplay(property: InspectedProperty, text: DesignModeStrings['toolbar']): InspectedProperty {
    const descriptor = property.descriptor;
    return {
        ...property,
        descriptor: {
            ...descriptor,
            label: text.shows,
            description: text.showsHelp,
            choices: descriptor.choices?.map(choice => ({ ...choice, label: text.displays[String(choice.value)] ?? choice.label })),
        },
    };
}
