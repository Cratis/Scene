// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentAnatomy } from '@cratis/scene.model';
import { componentAnatomy } from '@cratis/scene.react';

/** The severities PrimeReact gives a Button, `primary` being the one it has when none is chosen. */
export const buttonSeverities: readonly string[] = ['primary', 'secondary', 'success', 'info', 'warn', 'danger', 'help', 'contrast'];

/** The forms of a Button, which PrimeReact calls its `variant`: the look of a severity without a filled background. */
export const buttonForms: readonly string[] = ['outlined', 'text', 'link'];

/** The severities PrimeReact gives a Tag or a Badge: every Button one but `help`. */
export const labelSeverities: readonly string[] = ['primary', 'secondary', 'success', 'info', 'warn', 'danger', 'contrast'];

/** The severities of a Message in the design system's vocabulary; PrimeReact spells `danger` as `error`. */
export const messageSeverities: readonly string[] = ['info', 'success', 'warn', 'danger'];

/**
 * What each PrimeReact component takes from a design system (R2), keyed by the bare component name. `primeReactTheme.css` is where the
 * anatomy meets PrimeReact's own `--p-*` variables: the Button, the Tag, the Badge, the Message, the Card, the Input, the Text and the
 * Popover are restyled from it, and nothing else in this package names a token of a design system.
 *
 * The Button draws every variant PrimeReact has, each from the design system's own variant: the `severity` property chooses a severity
 * (`primary` is PrimeReact's default one, then `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`) or one of the three
 * forms (`outlined`, `text`, `link`, which PrimeReact calls its `variant`). The design system names its variants as PrimeReact does - the
 * name of a variant is what its custom properties are called - and one PrimeReact has no look for (`outline`, `rainbow`) is reported by
 * `linkDesignSystem` as `variantUnsupported`. The Tag and the Badge draw the severities PrimeReact gives them (no `help`); the Message
 * draws `info`, `success`, `warn` and `danger` (PrimeReact's `error`). The Text's variant is `tone` (`muted`), which the `muted` flag also sets.
 */
export const primeReactAnatomy: Readonly<Record<string, ComponentAnatomy>> = {
    button: componentAnatomy(['background', 'text', 'border', 'radius', 'shadow'], [...buttonSeverities, ...buttonForms], ['hover', 'focus', 'active'], 'severity'),
    tag: componentAnatomy(['background', 'text'], [...labelSeverities], [], 'severity'),
    badge: componentAnatomy(['background', 'text'], [...labelSeverities], [], 'severity'),
    message: componentAnatomy(['background', 'text', 'border'], [...messageSeverities], [], 'severity'),
    card: componentAnatomy(['background', 'text', 'border', 'radius'], ['default']),
    inputText: componentAnatomy(['background', 'text', 'border', 'radius', 'shadow'], ['default'], ['hover', 'focus', 'disabled']),
    text: componentAnatomy(['text', 'font'], ['default', 'muted'], [], 'tone'),
    overlayPanel: componentAnatomy(['background', 'text', 'border', 'radius'], ['default'], ['hover', 'selected']),
};
