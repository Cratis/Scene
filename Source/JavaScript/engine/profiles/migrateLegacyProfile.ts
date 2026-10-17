// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ColorScheme,
    Layout,
    PackageKind,
    ProfileAppearance,
    ProfileDefaults,
    ScreenTemplate,
    TemplateReference,
    TemplateReferenceSource,
    TemplateRole,
    TemplateScope,
    UiProfile,
} from '@cratis/scene.model';
import { validateLayoutApplicability, validateScreenTemplateApplicability } from '../templateApplicability';
import { TemplateLibrary } from '../templates/TemplateLibrary';
import { TemplateSource } from '../templates/TemplateSource';
import { serializeUiProfile } from '../uiProfileJson';
import { LegacyProfile } from './LegacyProfile';
import { ProfileMigration, ProfileMigrationDiagnostic } from './ProfileMigrationDiagnostic';
import { ProfileMigrationDiagnosticCode } from './ProfileMigrationDiagnosticCode';

/** The option of the root template the legacy navigation mode becomes. */
export const navigationModeOption = 'navigationMode';

/**
 * Turns a legacy profile - the blueprint (`shell`) and layout name, and the Studio-only settings that sat next to them - into the
 * shape the root template redesign gives it, in one pure step every host uses (Studio's migration, the Screenplay fix-it, the CLI).
 *
 * - The layout (the legacy `shell` first, then the application's own, then the installed blueprints) becomes `root.template`: a
 *   blueprint layout is a `blueprint` reference pinned to `^<installed major.minor>`, an application layout an `own` reference. With
 *   a `shell` and no layout the blueprint's first usable shell stands in. No shell and no layout: no root (the built-in Bare shell).
 * - `navigationMode` becomes `root.options.navigationMode`; `colorScheme` and `accent` become `appearance`;
 *   `defaultScreenTemplate` becomes `defaults.newScreenTemplate`.
 * - Values already in the new shape win over their legacy counterparts, so the function is idempotent: a migrated profile comes
 *   back unchanged, with or without the legacy fields next to it. Once a root exists the legacy `layout` is dropped.
 * - What cannot be mapped is reported in `diagnostics` (never thrown) and stays as it was.
 *
 * @param legacy The profile and the legacy settings next to it.
 * @param library The application's own templates (`own`) and the blueprints available, which the names are looked up in.
 * @returns The migrated profile, whether it changed, and what could not be mapped.
 */
export function migrateLegacyProfile(legacy: LegacyProfile, library: TemplateLibrary): ProfileMigration {
    const diagnostics: ProfileMigrationDiagnostic[] = [];
    const { layout: legacyLayout, ...rest } = legacy.profile;
    let layout: string | undefined = nonBlank(legacy.layout) ?? nonBlank(legacyLayout);

    let root = legacy.profile.root;
    if (root === undefined) {
        const template = deriveRoot(nonBlank(legacy.shell), layout, legacy.profile, library, diagnostics);
        if (template !== undefined) {
            root = { template };
            layout = undefined;
        }
    } else {
        layout = undefined;
    }

    const navigationMode = nonBlank(legacy.navigationMode);
    if (navigationMode !== undefined) {
        if (root === undefined) {
            diagnostics.push({
                code: ProfileMigrationDiagnosticCode.LegacyNavigationModeWithoutRoot,
                subject: navigationMode,
                message: `Navigation mode '${navigationMode}' of profile '${legacy.profile.name}' cannot be kept: the profile has no root template to carry it`,
            });
        } else if (root.options?.[navigationModeOption] === undefined) {
            root = { ...root, options: { ...root.options, [navigationModeOption]: navigationMode } };
        }
    }

    const migrated: UiProfile = { ...rest };
    if (layout !== undefined) migrated.layout = layout;
    if (root !== undefined) migrated.root = root;

    const appearance = appearanceOf(legacy, legacy.profile.appearance, diagnostics);
    if (appearance !== undefined) migrated.appearance = appearance;
    else delete migrated.appearance;

    const defaults = defaultsOf(legacy, legacy.profile, library, diagnostics);
    if (defaults !== undefined) migrated.defaults = defaults;
    else delete migrated.defaults;

    return { profile: migrated, changed: serializeUiProfile(migrated) !== serializeUiProfile(legacy.profile), diagnostics };
}

function deriveRoot(shell: string | undefined, layout: string | undefined, profile: UiProfile, library: TemplateLibrary, diagnostics: ProfileMigrationDiagnostic[]): TemplateReference | undefined {
    if (shell === undefined && layout === undefined) return undefined;

    if (shell !== undefined) {
        const blueprint = library.blueprints.find(candidate => candidate.manifest.name === shell && candidate.manifest.kind === PackageKind.Blueprint);
        if (blueprint === undefined) {
            diagnostics.push({
                code: ProfileMigrationDiagnosticCode.LegacyShellNotInstalled,
                subject: shell,
                message: `Shell '${shell}' of profile '${profile.name}' is not an available blueprint`,
            });
            return layout === undefined ? undefined : fromLayoutName(layout, undefined, profile, library, diagnostics);
        }

        if (layout !== undefined) return fromLayoutName(layout, blueprint, profile, library, diagnostics);

        const first = firstShellOf(blueprint);
        if (first === undefined) {
            diagnostics.push({
                code: ProfileMigrationDiagnosticCode.LegacyShellHasNoLayout,
                subject: shell,
                message: `Blueprint '${shell}' of profile '${profile.name}' provides no layout or root template an application can use as its shell`,
            });
            return undefined;
        }

        return blueprintReference(blueprint, first);
    }

    return fromLayoutName(layout!, undefined, profile, library, diagnostics);
}

function fromLayoutName(name: string, preferred: TemplateSource | undefined, profile: UiProfile, library: TemplateLibrary, diagnostics: ProfileMigrationDiagnostic[]): TemplateReference | undefined {
    if (preferred !== undefined && hasShell(preferred, name)) return blueprintReference(preferred, name);
    if (library.own !== undefined && hasShell(library.own, name)) return { source: TemplateReferenceSource.Own, id: name };

    const installed = library.blueprints.filter(candidate => profile.packages.includes(candidate.manifest.name));
    for (const blueprint of installed) {
        if (hasShell(blueprint, name)) return blueprintReference(blueprint, name);
    }

    diagnostics.push({
        code: ProfileMigrationDiagnosticCode.LegacyLayoutUnknown,
        subject: name,
        message: `Layout '${name}' of profile '${profile.name}' does not exist in the application or in ${preferred === undefined ? 'any installed blueprint' : `blueprint '${preferred.manifest.name}'`}`,
    });
    return undefined;
}

function hasShell(source: TemplateSource, name: string): boolean {
    return (source.layouts ?? []).some(layout => layout.name === name)
        || (source.screenTemplates ?? []).some(template => template.name === name && template.metadata?.role === TemplateRole.Root);
}

function firstShellOf(source: TemplateSource): string | undefined {
    const layout = (source.layouts ?? []).find((candidate: Layout) => validateLayoutApplicability(candidate, TemplateScope.Application).length === 0);
    if (layout !== undefined) return layout.name;
    return (source.screenTemplates ?? []).find((candidate: ScreenTemplate) =>
        candidate.metadata?.role === TemplateRole.Root && validateScreenTemplateApplicability(candidate, TemplateScope.Application).length === 0)?.name;
}

/** The pin a reference gets when it is created: the caret range of the installed blueprint's major.minor. */
export function pinOf(version: string): string | undefined {
    const match = /^(\d+)\.(\d+)/.exec(version.trim());
    return match === null ? undefined : `^${match[1]}.${match[2]}`;
}

function blueprintReference(blueprint: TemplateSource, id: string): TemplateReference {
    const reference: TemplateReference = { source: TemplateReferenceSource.Blueprint, id, blueprint: blueprint.manifest.name };
    const pin = pinOf(blueprint.manifest.version);
    if (pin !== undefined) reference.version = pin;
    return reference;
}

function appearanceOf(legacy: LegacyProfile, existing: ProfileAppearance | undefined, diagnostics: ProfileMigrationDiagnostic[]): ProfileAppearance | undefined {
    const appearance: ProfileAppearance = { ...existing };

    const scheme = nonBlank(legacy.colorScheme);
    if (scheme !== undefined && appearance.colorScheme === undefined) {
        const parsed = colorSchemeOf(scheme);
        if (parsed === undefined) {
            diagnostics.push({
                code: ProfileMigrationDiagnosticCode.LegacyColorSchemeUnknown,
                subject: scheme,
                message: `Colour scheme '${scheme}' of profile '${legacy.profile.name}' is not Light, Dark or System`,
            });
        } else {
            appearance.colorScheme = parsed;
        }
    }

    const accent = nonBlank(legacy.accent);
    if (accent !== undefined && appearance.accent === undefined) appearance.accent = accent;

    return appearance.colorScheme === undefined && appearance.accent === undefined ? undefined : appearance;
}

function colorSchemeOf(value: string): ColorScheme | undefined {
    switch (value.toLowerCase()) {
        case 'light': return ColorScheme.Light;
        case 'dark': return ColorScheme.Dark;
        case 'system': return ColorScheme.System;
        default: return undefined;
    }
}

function defaultsOf(legacy: LegacyProfile, profile: UiProfile, library: TemplateLibrary, diagnostics: ProfileMigrationDiagnostic[]): ProfileDefaults | undefined {
    const defaults: ProfileDefaults = { ...profile.defaults };
    const name = nonBlank(legacy.defaultScreenTemplate);
    if (name !== undefined && defaults.newScreenTemplate === undefined) {
        const reference = screenTemplateReference(name, profile, library);
        if (reference === undefined) {
            diagnostics.push({
                code: ProfileMigrationDiagnosticCode.LegacyDefaultScreenTemplateUnknown,
                subject: name,
                message: `Screen template '${name}', the default for new screens of profile '${profile.name}', does not exist in the application or in any installed blueprint`,
            });
        } else {
            defaults.newScreenTemplate = reference;
        }
    }

    return defaults.newScreenTemplate === undefined ? undefined : defaults;
}

function screenTemplateReference(name: string, profile: UiProfile, library: TemplateLibrary): TemplateReference | undefined {
    if ((library.own?.screenTemplates ?? []).some(template => template.name === name)) return { source: TemplateReferenceSource.Own, id: name };
    const blueprint = library.blueprints.find(candidate => profile.packages.includes(candidate.manifest.name)
        && (candidate.screenTemplates ?? []).some(template => template.name === name));
    return blueprint === undefined ? undefined : blueprintReference(blueprint, name);
}

function nonBlank(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}
