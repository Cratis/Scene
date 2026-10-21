// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprintName } from '../packageName';

/**
 * The packages this blueprint's themes declare compatibility with.
 *
 * `core` is on the list on purpose. `incompatiblePackages` has no implicit exemption for it - a theme
 * that omits it is reported incompatible for `core` with every profile that lists it, which is every
 * profile, since `core` is the fallback vocabulary. The exemption was left out of the engine deliberately
 * so that "compatible with everything active" has to be stated rather than assumed, and a theme shipped by
 * a blueprint is exactly where stating it matters.
 *
 * The rest covers this blueprint's components, the Cratis Components shell controls, and the optional
 * PrimeReact/Tailwind widget stack that older gallery templates can opt into. This list declares which
 * active packages the themes support; it does not load those optional packages.
 */
export const blueprintThemeCompatibility: string[] = ['core', defaultBlueprintName, 'PrimeReact', 'Cratis.Components', 'Tailwind'];
