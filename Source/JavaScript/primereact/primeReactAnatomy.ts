// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentAnatomy } from '@cratis/scene.model';
import { componentAnatomy } from '@cratis/scene.react';

/**
 * What each PrimeReact component takes from a design system (R2), keyed by the bare component name. `primeReactTheme.css` is where the
 * anatomy meets PrimeReact's own `--p-*` variables: the primary Button, the Card, the Input, the Text and the Popover are
 * restyled from it, and nothing else in this package names a token of a design system.
 *
 * The Button renders the `primary` variant (PrimeReact's default severity); a design system's other button variants are reported by
 * `linkDesignSystem` as not rendered rather than approximated, because PrimeReact's `secondary` severity and the rest are the active preset's
 * own and are not restyled from a design system. The Text's variant is `tone` (`muted`), which the `muted` flag also sets.
 */
export const primeReactAnatomy: Readonly<Record<string, ComponentAnatomy>> = {
    button: componentAnatomy(['background', 'text', 'border', 'radius', 'shadow'], ['primary'], ['hover', 'focus', 'active'], 'severity'),
    card: componentAnatomy(['background', 'text', 'border', 'radius'], ['default']),
    inputText: componentAnatomy(['background', 'text', 'border', 'radius', 'shadow'], ['default'], ['hover', 'focus', 'disabled']),
    text: componentAnatomy(['text', 'font'], ['default', 'muted'], [], 'tone'),
    overlayPanel: componentAnatomy(['background', 'text', 'border', 'radius'], ['default'], ['hover', 'selected']),
};
