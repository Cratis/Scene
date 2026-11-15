// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    describePackageList, describeShellCards, describeThemeCards, findProfileProblems, resolveEffectiveShell,
    type PackageList, type ShellCard, type ThemeCard,
} from '@cratis/scene.engine';
import { ColorScheme, type ScenePackage, type Theme } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { ApplicationTemplate } from '../../ScreenTemplates/ApplicationTemplate';
import { ownTemplateSource } from '../../ScreenTemplates/ownTemplateSource';
import type { ProfileUsage } from '../../UiProfile/ProfileUsage';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { shellLibraryOf } from '../Shell/shellLibraryOf';
import { sceneProfileOf } from './sceneProfileOf';

/** What Scene says about the profile being designed - one call each, nothing computed here (REN2). */
export interface SceneAnswers {
    /** The profile in Scene's own shape, which every answer below was asked of. */
    profile: ReturnType<typeof sceneProfileOf>;
    packageList: PackageList;
    shellCards: ShellCard[];
    themeCards: ThemeCard[];
    problems: ReturnType<typeof findProfileProblems>;
    manifests: ScenePackage[];
    themes: Theme[];
}

/**
 * Asks Scene everything the inspector draws: the package list with its reasons and locks, the shell and theme cards and the problems with their fixes.
 *
 * @param settings The settings being designed.
 * @param bundles The packages that can be chosen.
 * @param usages What the application's screens use, which decides what a removed package would break.
 * @param applicationTemplates The application's own templates, whose shells are cards too.
 * @returns The answers.
 */
export function askScene(settings: UiProfileSettings, bundles: ScenePackageBundle[], usages: ProfileUsage[], applicationTemplates: readonly ApplicationTemplate[]): SceneAnswers {
    const manifests = bundles.map(bundle => bundle.manifest);
    const themes = bundles.flatMap(bundle => bundle.themes ?? []);
    const profile = sceneProfileOf(settings, bundles);
    const library = shellLibraryOf(bundles, ownTemplateSource(applicationTemplates));
    const resolved = resolveUiProfile(settings, bundles);
    const shell = resolveEffectiveShell(resolved.profile, { library, themes, availablePackages: resolved.selection.packages });
    const colorScheme = settings.colorScheme === 'dark' ? ColorScheme.Dark : ColorScheme.Light;
    return {
        profile,
        packageList: describePackageList(profile, manifests),
        shellCards: describeShellCards(library),
        themeCards: describeThemeCards(profile, themes, manifests, colorScheme),
        problems: findProfileProblems(profile, {
            packages: manifests,
            library,
            theme: themes.find(theme => theme.name === settings.theme),
            shell,
            usages,
        }),
        manifests,
        themes,
    };
}
