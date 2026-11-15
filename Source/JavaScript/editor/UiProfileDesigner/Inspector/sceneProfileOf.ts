// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage, type PackageEdit } from '@cratis/scene.engine';
import type { UiProfile } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { explicitPackageNames } from '../../UiProfile/explicitPackageNames';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';

/**
 * The profile Scene's package list, theme cards, problems and fixes work on: the settings' own choices, with the packages in the order they are
 * stored (the shell's blueprint and the template packs included, so Scene can say why each is there).
 *
 * @param settings The settings being designed.
 * @param bundles The packages that can be chosen.
 * @returns A Scene profile.
 */
export function sceneProfileOf(settings: UiProfileSettings, bundles: ScenePackageBundle[]): UiProfile {
    const resolution = resolveUiProfile(settings, bundles);
    const resolved = resolution.profile;
    return {
        ...resolved,
        // The list in the order the resolver stores it - what is needed before what needs it, the packages that came in as dependencies included - which is
        // the order Scene's package list is described and edited in. The settings' own list is only what the author chose.
        packages: resolution.entries.length > 0 ? [...resolution.entries].map(entry => entry.name) : explicitPackageNames(settings),
        theme: settings.theme.length > 0 ? settings.theme : undefined,
        appearance: {
            colorScheme: settings.colorScheme === 'dark' ? 'Dark' : 'Light',
            ...(settings.accent.length > 0 ? { accent: settings.accent } : {}),
            ...(settings.corners === undefined ? {} : { corners: settings.corners }),
            ...(settings.font === undefined ? {} : { font: settings.font }),
        } as UiProfile['appearance'],
        ...(settings.identity === undefined ? {} : { identity: settings.identity }),
        defaultSizeClass: undefined,
    };
}

/**
 * Writes what Scene's edit did to the package list back into the settings. Scene answers the whole stored list, the packages that came in only as
 * dependencies included; the settings keep what the author chose - so a package is written back when it was chosen before the edit, or is the one the
 * edit added - in the order Scene answered, plus the template packs that are still listed and the shell, which Scene never removes.
 *
 * @param settings The settings before the edit.
 * @param edit What Scene's edit answered.
 * @returns The settings after it.
 */
export function withPackageEdit<T extends UiProfileSettings>(settings: T, edit: PackageEdit): T {
    const listed = edit.profile.packages;
    const chosenBefore = new Set([...settings.packages, ...settings.templatePacks, settings.shell]);
    const wanted = new Set([...chosenBefore, ...edit.added].filter(name => !edit.removed.includes(name)));
    return {
        ...settings,
        packages: listed.filter(name => name !== corePackage && wanted.has(name) && name !== settings.shell && !settings.templatePacks.includes(name)),
        templatePacks: listed.filter(name => settings.templatePacks.includes(name) && !edit.removed.includes(name)),
        shell: settings.shell.length > 0 && listed.includes(settings.shell) ? settings.shell : '',
        ...(edit.profile.theme === undefined ? {} : { theme: edit.profile.theme }),
    };
}
