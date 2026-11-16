// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprintName, previewProfile } from '@cratis/scene.blueprint.default';
import type { UiProfile } from '@cratis/scene.model';

// Admit the same host packages as Stage without adding optional widgets the application did not select.
// A selected PrimeReact still ranks just beneath the default blueprint; the author's profile is untouched.
export function compositionProfileOf(profile: UiProfile): UiProfile {
    const admitted = previewProfile([profile]);
    if (!profile.packages.includes('PrimeReact')) return admitted;
    const packages = admitted.packages.filter(name => name !== 'PrimeReact');
    packages.splice(Math.max(packages.indexOf(defaultBlueprintName), 0), 0, 'PrimeReact');
    return { ...admitted, packages };
}
