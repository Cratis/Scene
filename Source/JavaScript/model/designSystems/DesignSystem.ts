// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { AppearanceBindings } from './AppearanceBindings';
import { ContrastFinding } from './ContrastFinding';
import { ContrastRule } from './ContrastRule';
import { DesignComponent } from './DesignComponent';
import { DesignTheme } from './DesignTheme';
import { DesignWords } from './DesignWords';
import { TokenRole } from './TokenRole';

/**
 * A resolved design system: the contract an application is drawn from, with every theme's values already followed through
 * palettes and references. It is platform-neutral on purpose - a token has a value, a component has parts, and nothing says
 * what a part becomes in CSS or in a native style; a renderer decides that.
 *
 * The components are the contract between a design system and the component packages: a package component reads its look
 * from the anatomy a design system declares (its `primary` variant's `background` in `hover`), never from a token name.
 * Products name tokens freely.
 */
export interface DesignSystem {
    /** The design system's name. */
    name: string;

    /** The modes it is drawn in (for example `light` and `dark`). Every theme implements every mode. */
    modes: string[];

    /** The token roles: what each design token is for. */
    tokens: TokenRole[];

    /** The components, each with the parts, variants and states it is made of. */
    components: DesignComponent[];

    /** The themes that implement it, one flagged as the default. */
    themes: DesignTheme[];

    /** The words the product speaks with. Absent when the design system declares none. */
    words?: DesignWords;

    /** The contrast every theme must satisfy. Absent for none. */
    contrastRules?: ContrastRule[];

    /** The contrast measured for every theme, mode, component, variant and state a rule applies to. Absent when nothing was measured. */
    contrastFindings?: ContrastFinding[];

    /** Which token roles a profile's accent, corners and font replace. Absent when a profile cannot restyle the design system. */
    appearance?: AppearanceBindings;
}

export const DesignSystemPropertyNames: (keyof DesignSystem)[] = [
    'name', 'modes', 'tokens', 'components', 'themes', 'words', 'contrastRules', 'contrastFindings', 'appearance',
];
