// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, DesignSystem, DesignThemeMode, ProfileAppearance, Theme } from '@cratis/scene.model';
import { resolveAppearance } from '../profiles/resolveAppearance';
import { DesignDiagnosticCode } from './DesignDiagnosticCode';
import { DesignDiagnostic, ResolvedDesign } from './ResolvedDesign';
import { evaluateDesignComponents } from './evaluateDesignComponents';

/** What {@link resolveDesign} reads. */
export interface DesignContext {
    /** The design system to draw. */
    designSystem: DesignSystem;

    /** The name of the theme the profile selects. Absent, or unknown, selects the design system's default theme. */
    theme?: string;

    /**
     * Themes the active packages ship, each a flat map of token values for one mode. A name that is not one of the design
     * system's own themes is looked up here, and the theme's tokens are the values of the mode it declares (`isDark`).
     */
    packageThemes?: readonly Theme[];

    /** The appearance of the profile. */
    appearance?: ProfileAppearance;

    /** Whether the system is in dark mode; decides `System`. Absent means light. */
    systemIsDark?: boolean;

    /** The ids of the fonts the host can use. Absent means every font of the catalog. */
    availableFonts?: readonly string[];
}

/**
 * Resolves a design system for what a profile asks of it: the theme, the mode its colour scheme selects, and the accent, corners
 * and font it replaces the theme's own with. One function for Studio's preview, Stage and generated React, so they cannot disagree
 * about which theme and mode a profile gets.
 *
 * The mode follows the colour scheme (`System` follows the system); when the scheme is not a mode the design system declares, its
 * first mode is used. A theme named by the profile that the design system does not have is looked up among the themes of the
 * packages; one nobody has falls back to the default theme with a diagnostic.
 *
 * @param context The design system, the profile's choices and what the host can do.
 * @returns The theme, mode, token values and resolved components to draw, and a diagnostic for everything that was refused.
 */
export function resolveDesign(context: DesignContext): ResolvedDesign {
    const designSystem = context.designSystem;
    const diagnostics: DesignDiagnostic[] = [];
    const modes = designSystem.modes;
    const requested = context.appearance?.colorScheme;
    const scheme = requested === ColorScheme.System ? (context.systemIsDark === true ? ColorScheme.Dark : ColorScheme.Light) : requested;
    const schemeMode = scheme === undefined ? undefined : scheme === ColorScheme.Dark ? 'dark' : 'light';

    const own = context.theme === undefined ? undefined : designSystem.themes.find(candidate => candidate.name === context.theme);
    const shipped = own !== undefined || context.theme === undefined ? undefined : context.packageThemes?.find(candidate => candidate.name === context.theme);
    if (context.theme !== undefined && own === undefined && shipped === undefined) {
        diagnostics.push({
            code: DesignDiagnosticCode.ThemeNotFound,
            message: `The theme '${context.theme}' is not a theme of the design system '${designSystem.name}' or of its packages, so the default theme is used.`,
        });
    }

    const designTheme = own ?? (shipped === undefined ? (designSystem.themes.find(candidate => candidate.isDefault === true) ?? designSystem.themes[0]) : undefined);

    let mode: string | undefined;
    let themeName: string;
    let isDark: boolean;
    let values: DesignThemeMode | undefined;

    if (shipped !== undefined) {
        themeName = shipped.name;
        isDark = shipped.isDark === true;
        const native = isDark ? 'dark' : 'light';
        mode = modes.length === 0 || modes.includes(native) ? native : modes[0];
        values = { mode, tokens: { ...(shipped.tokens ?? {}) } };
    } else {
        themeName = designTheme?.name ?? designSystem.name;
        if (schemeMode !== undefined && !modes.includes(schemeMode) && requested !== ColorScheme.System) {
            diagnostics.push({
                code: DesignDiagnosticCode.ModeNotDeclared,
                message: `The colour scheme ${schemeMode} is not a mode of the design system '${designSystem.name}', so its first mode is used.`,
            });
        }

        mode = schemeMode !== undefined && modes.includes(schemeMode) ? schemeMode : modes[0];
        values = designTheme?.modes.find(candidate => candidate.mode === mode);
        if (designTheme !== undefined && values === undefined && mode !== undefined) {
            diagnostics.push({
                code: DesignDiagnosticCode.ModeNotImplemented,
                message: `The theme '${designTheme.name}' has no values for the mode '${mode}'.`,
            });
        }

        isDark = mode === 'dark';
    }

    // The mode already follows the colour scheme, so the theme is drawn as chosen; only a theme shipped by a package, which has one scheme of its own, is checked against it.
    const { colorScheme: _scheme, ...rest } = context.appearance ?? {};
    const themed: Theme = { name: themeName, compatibleWith: [], isDark, tokens: { ...(values?.tokens ?? {}) } };
    const appearance = resolveAppearance({
        theme: themed,
        appearance: shipped === undefined ? rest : context.appearance,
        systemIsDark: context.systemIsDark,
        availableFonts: context.availableFonts,
        bindings: designSystem.appearance ?? {},
    });

    const unchanged = values !== undefined && Object.keys(appearance.tokens).length === Object.keys(values.tokens).length
        && Object.entries(appearance.tokens).every(([role, value]) => values.tokens[role] === value);
    let components = values?.components;
    if (components === undefined || !unchanged) {
        const evaluated = evaluateDesignComponents(designSystem.components, appearance.tokens, shipped === undefined);
        components = evaluated.components;
        for (const problem of evaluated.problems) diagnostics.push({ code: DesignDiagnosticCode.TokenUnresolved, message: problem });
    }

    return {
        designSystem: designSystem.name,
        theme: themeName,
        ...(mode === undefined ? {} : { mode }),
        colorScheme: appearance.colorScheme,
        tokens: appearance.tokens,
        components,
        appearance,
        diagnostics,
    };
}
