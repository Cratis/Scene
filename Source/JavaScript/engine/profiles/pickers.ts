// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, ScenePackage, Theme, UiProfile } from '@cratis/scene.model';
import { BlueprintPinStatus, defaultBlueprintPin, evaluateBlueprintPin } from '../blueprints/evaluateBlueprintPin';
import { TemplateLibrary } from '../templates/TemplateLibrary';
import { TemplateSource } from '../templates/TemplateSource';
import { NavigationMode, normalizeNavigationMode } from './shellOptions';

/* ------------------------------------------------------------------------------------------------------------------------------------------
 * Blueprint (shell) cards
 * ---------------------------------------------------------------------------------------------------------------------------------------- */

/** One shell a designer offers as a card: what to call it, what it is, its wireframe and the menu mode it starts in. */
export interface ShellCard {
    /** The package the shell comes from; empty for the application's own. */
    blueprint: string;

    /** The template's name, which is what a `root.template` reference names. */
    id: string;

    title: string;

    description: string;

    /** The package-relative path of the wireframe thumbnail. */
    thumbnail: string;

    /** The menu mode choosing this shell sets (the author can change it afterwards). */
    defaultMenuMode: NavigationMode;
}

/**
 * Describes the shells a designer offers as cards, from the metadata they carry - a shell is offered when it declares a default menu mode. A shell
 * that declares none (a full-page shell without a menu) is not a card.
 *
 * @param library The application's own templates and the blueprints that are available.
 * @returns The cards: the application's own first, then each blueprint's, in the order they are declared.
 */
export function describeShellCards(library: TemplateLibrary): ShellCard[] {
    const cards: ShellCard[] = [];
    const sources: { source: TemplateSource | undefined; blueprint: string }[] = [{ source: library.own, blueprint: '' }, ...library.blueprints.map(source => ({ source, blueprint: source.manifest.name }))];
    for (const { source, blueprint } of sources) {
        if (source === undefined) continue;
        const templates = [...(source.layouts ?? []), ...(source.screenTemplates ?? []).filter(template => template.metadata?.role === 'Root')];
        for (const template of templates) {
            const metadata = template.metadata;
            const mode = normalizeNavigationMode(metadata?.defaultMenuMode);
            if (mode === undefined) continue;
            const described = template as { displayName?: string; description?: string };
            cards.push({
                blueprint,
                id: template.name,
                title: metadata?.displayName ?? described.displayName ?? template.name,
                description: metadata?.description ?? described.description ?? '',
                thumbnail: metadata?.thumbnail ?? '',
                defaultMenuMode: mode,
            });
        }
    }

    return cards;
}

/* ------------------------------------------------------------------------------------------------------------------------------------------
 * Theme cards
 * ---------------------------------------------------------------------------------------------------------------------------------------- */

/** One theme a designer offers as a card. */
export interface ThemeCard {
    name: string;

    scheme: 'light' | 'dark';

    /** The accent the card's bar is drawn in. */
    accent?: string;

    /** The corner radius in words (`8px corners`). */
    corners?: string;

    description?: string;

    selected: boolean;

    /** Whether choosing the theme needs nothing more. */
    available: boolean;

    /** The package choosing the theme would add. */
    package?: string;

    /** Why the theme is not available, ready to show. */
    reason?: string;
}

const defaultLightTheme = 'Scene Default Light';
const defaultDarkTheme = 'Scene Default Dark';

function cornersOf(radius: string | undefined): string | undefined {
    if (radius === undefined) return undefined;
    const rem = /^(\d+(?:\.\d+)?)rem$/.exec(radius.trim());
    if (rem !== null) return `${Math.round(Number(rem[1]) * 16)}px corners`;
    return `${radius.trim()} corners`;
}

/**
 * Describes the theme cards: each theme's scheme, accent and corners, whether choosing it needs a package the profile does not list (and which),
 * and which one is selected. Themes are filtered by the colour scheme when one is given.
 *
 * @param profile The profile.
 * @param themes Every theme that could be chosen, in the order to offer them.
 * @param catalog Every package that could be selected; a theme belongs to the package that lists it.
 * @param scheme The colour scheme to show themes of; every theme when absent.
 * @returns The cards.
 */
export function describeThemeCards(profile: UiProfile, themes: readonly Theme[], catalog: readonly ScenePackage[], scheme?: ColorScheme.Light | ColorScheme.Dark): ThemeCard[] {
    return themes
        .filter(theme => scheme === undefined || (theme.isDark === true ? ColorScheme.Dark : ColorScheme.Light) === scheme)
        .map(theme => {
            const suppliers = catalog.filter(candidate => candidate.themes.includes(theme.name));
            const missing = suppliers.length > 0 && !suppliers.some(supplier => profile.packages.includes(supplier.name)) ? suppliers[0] : undefined;
            const accent = theme.tokens?.['primary.color'];
            const corners = cornersOf(theme.tokens?.['content.borderRadius']);
            return {
                name: theme.name,
                scheme: theme.isDark === true ? 'dark' : 'light',
                ...(accent === undefined ? {} : { accent }),
                ...(corners === undefined ? {} : { corners }),
                ...(theme.description === undefined ? {} : { description: theme.description }),
                selected: profile.theme === theme.name,
                available: missing === undefined,
                ...(missing === undefined ? {} : { package: missing.name, reason: `Needs ${missing.displayName ?? missing.name}. Selecting it adds the package.` }),
            } as ThemeCard;
        });
}

export interface ColorSchemeEdit {
    profile: UiProfile;

    /** Whether the theme moved to the matching one. */
    themeChanged: boolean;

    /** The line for the status bar; empty when nothing moved. */
    message: string;
}

/**
 * Switches the colour scheme. When the selected theme belongs to the other scheme, the theme moves to the matching Scene Default theme.
 *
 * @param profile The profile.
 * @param scheme The scheme to switch to.
 * @param themes Every theme that could be chosen.
 * @returns The profile after the switch.
 */
export function switchColorScheme(profile: UiProfile, scheme: ColorScheme.Light | ColorScheme.Dark, themes: readonly Theme[]): ColorSchemeEdit {
    const switched: UiProfile = { ...profile, appearance: { ...profile.appearance, colorScheme: scheme } };
    const current = themes.find(theme => theme.name === profile.theme);
    if (current === undefined || (current.isDark === true ? ColorScheme.Dark : ColorScheme.Light) === scheme) return { profile: switched, themeChanged: false, message: '' };
    const target = scheme === ColorScheme.Dark ? defaultDarkTheme : defaultLightTheme;
    if (!themes.some(theme => theme.name === target)) return { profile: switched, themeChanged: false, message: '' };
    return { profile: { ...switched, theme: target }, themeChanged: true, message: `Theme changed to ${target} to match the ${scheme === ColorScheme.Dark ? 'dark' : 'light'} scheme` };
}

/* ------------------------------------------------------------------------------------------------------------------------------------------
 * Version rule
 * ---------------------------------------------------------------------------------------------------------------------------------------- */

export enum VersionRuleKind {
    /** Follow compatible versions: `^1.0.0`. */
    Follow = 'follow',

    /** Stay on exactly this version. */
    Pin = 'pin',

    /** Always take the latest. */
    Latest = 'latest',
}

export interface VersionRuleChoice {
    kind: VersionRuleKind;

    label: string;

    description: string;

    /** What is stored as the template reference's version. */
    pin: string;
}

export interface VersionRuleStatus {
    tone: 'good' | 'info' | 'warning' | 'bad';

    /** The chip text. */
    text: string;
}

export interface VersionRuleDescription {
    choices: VersionRuleChoice[];

    /** The choice the stored rule is; absent when it is a rule of the author's own writing. */
    selected?: VersionRuleKind;

    status: VersionRuleStatus;
}

/**
 * Describes the version rule of the shell blueprint: the three choices and the status chip, answered from the package resolver.
 *
 * @param pin The stored rule; absent means follow compatible versions.
 * @param installedVersion The version of the blueprint that is installed.
 * @param latestVersion The newest version there is, when known.
 * @returns The choices, the one that is selected and what to say about the version.
 */
export function describeVersionRule(pin: string | undefined, installedVersion: string, latestVersion?: string): VersionRuleDescription {
    const follow = defaultBlueprintPin(installedVersion);
    const choices: VersionRuleChoice[] = [
        { kind: VersionRuleKind.Follow, label: 'Follow compatible versions', description: `Takes updates that ${follow} allows`, pin: follow },
        { kind: VersionRuleKind.Pin, label: `Pin to ${installedVersion}`, description: 'Stays on exactly this version', pin: installedVersion },
        { kind: VersionRuleKind.Latest, label: 'Always the latest', description: 'Takes every new version, including breaking ones', pin: '*' },
    ];

    const stored = pin?.trim() ?? '';
    const normalized = stored.startsWith('=') ? stored.slice(1).trim() : stored;
    const selected = stored === '' || stored === follow ? VersionRuleKind.Follow : normalized === installedVersion ? VersionRuleKind.Pin : stored === '*' ? VersionRuleKind.Latest : undefined;

    const evaluation = evaluateBlueprintPin(pin, installedVersion, latestVersion);
    const status: VersionRuleStatus = evaluation.status === BlueprintPinStatus.Current ? { tone: 'good', text: 'Up to date' }
        : evaluation.status === BlueprintPinStatus.UpdateAvailable ? { tone: 'info', text: `Version ${latestVersion} is available and compatible` }
            : evaluation.status === BlueprintPinStatus.UpdateBlockedByPin ? { tone: 'warning', text: `Version ${latestVersion} is available but ${evaluation.pin} does not allow it` }
                : { tone: 'bad', text: evaluation.message };

    return { choices, ...(selected === undefined ? {} : { selected }), status };
}

/* ------------------------------------------------------------------------------------------------------------------------------------------
 * My own shell
 * ---------------------------------------------------------------------------------------------------------------------------------------- */

export interface OwnShellValue {
    valid: boolean;

    kind?: 'package' | 'path';

    /** What is wrong; empty when the value is valid. */
    message: string;
}

const packageName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;

/**
 * Says what a valid value for "my own shell" is: a package name (`@acme/shell`, `acme-shell`) or a path (`./shell`, `../shells/main`, `/opt/shell`).
 * An empty value is reported - as the `ownShellHasNoValue` problem when it is chosen.
 *
 * @param value What was entered.
 * @returns Whether it is valid and what it is.
 */
export function describeOwnShellValue(value: string | undefined): OwnShellValue {
    const text = value?.trim() ?? '';
    if (text === '') return { valid: false, message: 'Enter a package name or a path' };
    if (/^(?:\.{1,2}\/|\/|~\/)/.test(text) && !/\s/.test(text)) return { valid: true, kind: 'path', message: '' };
    if (packageName.test(text)) return { valid: true, kind: 'package', message: '' };
    return { valid: false, message: `'${text}' is neither a package name nor a path` };
}
