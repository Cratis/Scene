// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ResolvedDesignComponent } from '@cratis/scene.model';
import { ColorScheme } from '@cratis/scene.model';
import { ResolvedAppearance } from '../profiles/resolveAppearance';
import { DesignDiagnosticCode } from './DesignDiagnosticCode';

/** One thing wrong with the selection or resolution of a design system. */
export interface DesignDiagnostic {
    code: DesignDiagnosticCode;
    message: string;
}

/** A design system resolved for one theme and mode, with the appearance of the profile applied: what a renderer draws. */
export interface ResolvedDesign {
    /** The name of the design system. */
    designSystem: string;

    /** The name of the theme in effect. */
    theme: string;

    /** The mode in effect. Absent when the design system declares none. */
    mode?: string;

    /** The scheme in effect: never `System`. */
    colorScheme: ColorScheme.Light | ColorScheme.Dark;

    /** The value of each token role, with the accent, corners and font of the profile applied. */
    tokens: Record<string, string>;

    /** The components, every part resolved to a value. */
    components: ResolvedDesignComponent[];

    /** What the appearance of the profile resolved to: the font and the diagnostics of refusing an accent, a font or a binding. */
    appearance: ResolvedAppearance;

    /** What went wrong selecting the theme and mode, and resolving the parts. */
    diagnostics: DesignDiagnostic[];
}
