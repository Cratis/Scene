// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { StoredTemplateReference, StoredUiProfileDefaults, StoredUiProfileRoot, StoredUiProfileShape, UiProfileDocumentValue } from './StoredUiProfileShape';
import { UiProfileSettings } from './UiProfileSettings';
import { persistedFromSettings } from './persistedFromSettings';
import { styleOf } from './profileStyle';
import { normalizeNavigationMode } from '@cratis/scene.engine';

const none: StoredTemplateReference = { source: '', blueprint: '', id: '', version: '', isNone: true };

function rootTemplateOf(template: NonNullable<UiProfileSettings['root']>['template']): StoredTemplateReference {
    return { source: template.source === TemplateReferenceSource.Own ? 'own' : 'blueprint', blueprint: template.blueprint ?? '', id: template.id, version: template.version ?? '', isNone: false };
}

// The root's options spell the menu mode the typed way (`slimPlus`); what is stored under the old spelling (`slim-plus`) reads as the same mode.
const typedModeOf = (mode: string): string => normalizeNavigationMode(mode) ?? mode;
const sameMode = (left: unknown, right: string): boolean => normalizeNavigationMode(left) === normalizeNavigationMode(right) && normalizeNavigationMode(left) !== undefined;

function optionsOf(mode: string, menuTheme: string | undefined, existing?: string): string {
    let options: Record<string, unknown> = {};
    try {
        const parsed = existing ? JSON.parse(existing) : {};
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) options = parsed as Record<string, unknown>;
    } catch {
        // Options that do not parse are replaced by the one option this designer edits.
    }
    return JSON.stringify({ ...options, navigationMode: typedModeOf(mode), ...(menuTheme === undefined ? {} : { menuTheme }) });
}

/**
 * Turns the settings the designer edits into the profile document the application stores in the root-template shape.
 *
 * What the designer does not edit is saved back as it was: when the shell is the one that was stored, its template reference
 * (including a version pin or an own template the settings cannot express) is kept, and so are the defaults when the
 * default screen template is unchanged.
 *
 * @param settings The settings to store.
 * @param bundles Every known package bundle.
 * @param stored What was stored when the designer opened, if anything.
 * @returns The profile document.
 */
export function uiProfileDocumentOf(settings: UiProfileSettings, bundles: ScenePackageBundle[], stored?: StoredUiProfileShape): UiProfileDocumentValue {
    const persisted = persistedFromSettings(settings, bundles);

    const sameShell = stored?.root !== undefined && stored.settings.shell === settings.shell;
    const root: StoredUiProfileRoot = settings.root !== undefined
        // The designer chose the root, or read it from what was stored: the settings say all of it, the pin and the options of the shell included.
        ? { template: rootTemplateOf(settings.root.template), optionsJson: optionsOf(settings.navigationMode, settings.menuTheme, JSON.stringify(settings.root.options ?? {})) }
        : {
            template: sameShell
                ? stored!.root!.template
                : settings.shell === ''
                    ? none
                    : { source: 'blueprint', blueprint: settings.shell, id: persisted.layout, version: '', isNone: false },
            optionsJson: stored?.root && sameMode(stored.settings.navigationMode, settings.navigationMode) && stored.settings.menuTheme === settings.menuTheme && sameShell
                ? stored.root.optionsJson
                : optionsOf(settings.navigationMode, settings.menuTheme, sameShell ? stored!.root!.optionsJson : undefined),
        };

    const sameDefault = stored?.defaults !== undefined && stored.settings.defaultScreenTemplate === settings.defaultScreenTemplate;
    const defaults: StoredUiProfileDefaults = sameDefault
        ? stored!.defaults!
        : { newScreenTemplate: settings.defaultScreenTemplate === '' ? none : { source: 'own', blueprint: '', id: settings.defaultScreenTemplate, version: '', isNone: false } };

    return {
        packages: persisted.packages,
        templatePacks: persisted.templatePacks,
        resolvedPackages: persisted.resolvedPackages,
        theme: persisted.theme,
        root,
        appearance: { colorScheme: settings.colorScheme, accent: settings.accent },
        defaults,
        style: styleOf(settings),
    };
}
