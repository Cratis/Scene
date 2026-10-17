// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, CornerStyle, ProfileAppearance, Theme } from '@cratis/scene.model';
import { FontChoice, FontSource, fontCatalog, systemFontId } from './fontCatalog';

/** What can be wrong with the appearance of a profile. The codes are camelCase and engine-owned. */
export enum AppearanceDiagnosticCode {
    /** The font is not in the catalog or not available to the host; the system font is used. */
    FontUnavailable = 'fontUnavailable',

    /** The accent is not a hex colour; the theme's accent is kept. */
    AccentInvalid = 'accentInvalid',

    /** The theme is a dark theme under a light scheme or the other way round; the theme is applied as chosen. */
    ThemeSchemeMismatch = 'themeSchemeMismatch',
}

export interface AppearanceDiagnostic {
    code: AppearanceDiagnosticCode;
    message: string;
}

/** What {@link resolveAppearance} reads. */
export interface AppearanceContext {
    /** The theme the profile selects. Absent, there are no theme tokens to start from. */
    theme?: Theme;

    /** The appearance of the profile. */
    appearance?: ProfileAppearance;

    /** Whether the system is in dark mode; decides `System`. Absent means light. */
    systemIsDark?: boolean;

    /** The ids of the fonts the host can use. Absent means every font of the catalog. */
    availableFonts?: readonly string[];
}

/** The appearance as a renderer applies it. */
export interface ResolvedAppearance {
    /** The scheme in effect: never `System`. */
    colorScheme: ColorScheme.Light | ColorScheme.Dark;

    /** The effective semantic tokens: the theme's, with the accent, the corner radius and the font family applied. */
    tokens: Record<string, string>;

    /** The id of the font in effect; the system font when the chosen one is unavailable. Absent when the profile chooses none and the theme's own font stays. */
    font?: string;

    /** The stylesheet a host loads to get a hosted font. */
    fontStylesheet?: string;

    diagnostics: AppearanceDiagnostic[];
}

/** The corner radius each choice resolves to. `Default` has none: it leaves the theme's own. */
export const cornerRadii: Readonly<Record<CornerStyle, string | undefined>> = {
    [CornerStyle.Sharp]: '4px',
    [CornerStyle.Default]: undefined,
    [CornerStyle.Round]: '18px',
};

const hexPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** The red, green and blue of a 3-, 4-, 6- or 8-digit hex colour, or undefined when it is not one. */
export function parseHexColor(value: string): [number, number, number] | undefined {
    if (!hexPattern.test(value)) return undefined;
    const digits = value.slice(1);
    const wide = digits.length <= 4;
    const channel = (index: number) => parseInt(wide ? digits[index] + digits[index] : digits.slice(index * 2, index * 2 + 2), 16);
    return [channel(0), channel(1), channel(2)];
}

/** Looks a font up by id. */
export function findFont(id: string): FontChoice | undefined {
    return fontCatalog.find(font => font.id === id);
}

/**
 * Resolves the appearance of a profile: scheme, theme, accent, corners and font in, effective tokens out. One function for Studio's preview,
 * Stage and generated React, so they cannot disagree about what `round` or an accent means.
 *
 * @param context The theme and appearance, and what the host can do.
 * @returns The scheme and tokens to apply, and a diagnostic for everything that was refused.
 */
export function resolveAppearance(context: AppearanceContext): ResolvedAppearance {
    const appearance = context.appearance ?? {};
    const diagnostics: AppearanceDiagnostic[] = [];
    const tokens: Record<string, string> = { ...(context.theme?.tokens ?? {}) };

    const requested = appearance.colorScheme ?? (context.theme?.isDark === true ? ColorScheme.Dark : ColorScheme.Light);
    const colorScheme = requested === ColorScheme.System ? (context.systemIsDark === true ? ColorScheme.Dark : ColorScheme.Light) : requested;

    if (context.theme !== undefined && appearance.colorScheme !== undefined && (context.theme.isDark === true ? ColorScheme.Dark : ColorScheme.Light) !== colorScheme) {
        diagnostics.push({
            code: AppearanceDiagnosticCode.ThemeSchemeMismatch,
            message: `The theme '${context.theme.name}' is a ${context.theme.isDark ? 'dark' : 'light'} theme, but the colour scheme is ${colorScheme === ColorScheme.Dark ? 'dark' : 'light'}.`,
        });
    }

    if (appearance.accent !== undefined && appearance.accent !== '') {
        const rgb = parseHexColor(appearance.accent);
        if (rgb === undefined) {
            diagnostics.push({
                code: AppearanceDiagnosticCode.AccentInvalid,
                message: `The accent '${appearance.accent}' is not a hex colour such as #4f46e5, so the theme's accent is kept.`,
            });
        } else {
            tokens['primary.color'] = appearance.accent;
            tokens['focus.ring'] = `0 0 0 2px rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.4)`;
        }
    }

    const radius = cornerRadii[appearance.corners ?? CornerStyle.Default];
    if (radius !== undefined) tokens['content.borderRadius'] = radius;

    const requestedFont = appearance.font;
    let font: FontChoice | undefined;
    if (requestedFont !== undefined && requestedFont !== '') {
        const found = findFont(requestedFont);
        font = findFont(systemFontId)!;
        if (found !== undefined && (context.availableFonts === undefined || context.availableFonts.includes(found.id))) {
            font = found;
        } else {
            diagnostics.push({
                code: AppearanceDiagnosticCode.FontUnavailable,
                message: `The font '${requestedFont}' is not available, so the system font is used.`,
            });
        }
        tokens['text.fontFamily'] = font.family;
    }

    return {
        colorScheme: colorScheme as ColorScheme.Light | ColorScheme.Dark,
        tokens,
        ...(font === undefined ? {} : { font: font.id }),
        ...(font?.source === FontSource.Hosted && font.stylesheet !== undefined ? { fontStylesheet: font.stylesheet } : {}),
        diagnostics,
    };
}
