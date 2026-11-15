// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, LayoutMode } from '@cratis/scene.blueprint.default';
import { PackageKind } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';
import { UiProfileSettings } from './UiProfileSettings';
import { initialPackageSelection } from '../BlueprintPreview/initialPackageSelection';
import { resolveUiProfile } from './resolveUiProfile';

/**
 * The profile an application has before anyone applies one: the base component library, the styling
 * packages and the first blueprint the catalog offers as the shell.
 *
 * Preview, the screen editor and Play all fall back to this when nothing has been applied, so an
 * application without a stored profile still renders the same everywhere.
 *
 * @param bundles Every known package bundle.
 * @returns The default settings.
 */
export function defaultUiProfileSettings(bundles: ScenePackageBundle[]): UiProfileSettings {
    const catalog = bundles.map(bundle => bundle.manifest);
    const initial = initialPackageSelection(catalog);
    const shell = initial.find(name => catalog.find(manifest => manifest.name === name)?.kind === PackageKind.Blueprint) ?? '';
    const settings: UiProfileSettings = {
        packages: initial.filter(name => name !== shell && name !== corePackage),
        shell,
        templatePacks: [],
        theme: '',
        colorScheme: ColorScheme.Light,
        navigationMode: LayoutMode.Static,
        accent: '',
        defaultScreenTemplate: '',
    };
    const theme = resolveUiProfile(settings, bundles).compatibleThemes.find(candidate => !candidate.isDark);

    return { ...settings, theme: theme?.name ?? '' };
}
