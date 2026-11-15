// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, LayoutMode, colorSchemes, layoutModes } from '@cratis/scene.blueprint.default';
import { TemplateReferenceSource } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { PersistedUiProfile } from './PersistedUiProfile';
import type { SampleDataSelectionSettings } from './SampleDataSelectionSettings';
import { UiProfileSettings } from './UiProfileSettings';
import { packagesOrLegacyFallback } from './packagesOrLegacyFallback';

/**
 * Reads stored settings back into the choices a draft edits.
 *
 * A stored color scheme or navigation mode this build does not know - written by a newer shell, say - falls
 * back to the default rather than throwing, so the page still opens and the next apply repairs the value.
 *
 * @param persisted The stored profile.
 * @param sampleData The application's sample data choice, which is stored apart from the profile; absent when none was made.
 * @param bundles Every known package bundle. With them, a stored layout that is not the blueprint's first one is read back as the profile's root template; without
 * them the profile is read as the blueprint's shell.
 * @returns The {@link UiProfileSettings} it records.
 */
export function settingsFromPersisted(persisted: PersistedUiProfile, sampleData?: SampleDataSelectionSettings, bundles?: ScenePackageBundle[]): UiProfileSettings {
    const selection = packagesOrLegacyFallback(persisted, bundles);
    const first = bundles?.find(bundle => bundle.manifest.name === persisted.shell)?.manifest.layouts[0];
    const chosen = persisted.layout.length > 0 && first !== undefined && persisted.layout !== first && bundles?.find(bundle => bundle.manifest.name === persisted.shell)?.manifest.layouts.includes(persisted.layout);
    return {
        packages: [...selection.packages],
        shell: persisted.shell,
        ...(chosen ? { root: { template: { source: TemplateReferenceSource.Blueprint, blueprint: persisted.shell, id: persisted.layout } } } : {}),
        templatePacks: [...selection.templatePacks],
        theme: persisted.theme,
        colorScheme: colorSchemes.find(scheme => scheme === persisted.colorScheme) ?? ColorScheme.Light,
        navigationMode: layoutModes.find(mode => mode === persisted.navigationMode) ?? LayoutMode.Static,
        accent: persisted.accent,
        defaultScreenTemplate: persisted.defaultScreenTemplate,
        ...(sampleData ? { sampleData: { activePack: sampleData.activePack, mappings: sampleData.mappings.map(mapping => ({ ...mapping })), bindings: (sampleData.bindings ?? []).map(binding => ({ ...binding })) } } : {}),
    };
}
