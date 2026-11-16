// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource, type Screen, type ScreenTemplate, type TemplateReference } from '@cratis/scene.model';
import {
    defaultBlueprintPin,
    placeableScreenTemplates,
    planShellSwitch,
    resolveEffectiveShell,
    type EffectiveShell,
    type SlotRemaps,
    type ShellResolutionContext,
    type ShellSwitchPlan,
    type TemplateLibrary,
} from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { withCompatibleTheme } from '../../UiProfile/withCompatibleTheme';

/** What a switch is worked out against: the application's templates and screens, and the bundles the profile resolves through. */
export interface ShellSwitchContext {
    bundles: ScenePackageBundle[];
    library: TemplateLibrary;
    screens: readonly Screen[];
}

/**
 * The profile with a template as its root, and nothing else changed. A blueprint's template comes with its blueprint (the resolver adds the package) and is
 * pinned to follow the compatible versions of the one installed; the options of the shell in place do not carry over, they belong to a shell.
 *
 * @param settings The current settings.
 * @param template What becomes the root.
 * @param bundles Every known package bundle.
 * @returns The settings; the theme is kept valid for the packages the new shell brings. A blueprint the application leaves for an own shell stays among its packages.
 */
export function withRootTemplate(settings: UiProfileSettings, template: TemplateReference, bundles: ScenePackageBundle[]): UiProfileSettings {
    const isBlueprint = template.source === TemplateReferenceSource.Blueprint && template.blueprint !== undefined;
    const installed = isBlueprint ? bundles.find(bundle => bundle.manifest.name === template.blueprint)?.manifest.version : undefined;
    const pinned: TemplateReference = isBlueprint && template.version === undefined && installed !== undefined ? { ...template, version: defaultBlueprintPin(installed) } : template;
    // An own shell is often made from the blueprint's (it starts as a copy of its AppShell), and the components it places are that blueprint's: the blueprint stays among
    // the packages, as one whose templates are offered, rather than going with the shell it supplied. The author can remove it in Packages, where what uses it is checked.
    const kept = !isBlueprint && settings.shell.length > 0 && !settings.templatePacks.includes(settings.shell) ? [settings.shell] : [];
    const next: UiProfileSettings = {
        ...settings,
        shell: isBlueprint ? template.blueprint! : '',
        root: { template: pinned, options: {} },
        templatePacks: [...settings.templatePacks.filter(name => name !== template.blueprint), ...kept],
    };
    return withCompatibleTheme(next, bundles);
}

/** Scene's answer to what the shell is, for settings. */
export function effectiveShellOf(settings: UiProfileSettings, context: ShellSwitchContext, available?: readonly string[]): EffectiveShell {
    const resolved = resolveUiProfile(settings, context.bundles);
    const resolution: ShellResolutionContext = {
        library: context.library,
        screens: context.screens,
        themes: context.bundles.flatMap(bundle => bundle.themes ?? []),
        availablePackages: available ?? resolved.selection.packages,
    };
    return resolveEffectiveShell(resolved.profile, resolution);
}

/** What switching to the template would do: the pre-flight of "Use this shell". */
export interface ShellSwitch {
    /** The shell in place. */
    current: EffectiveShell;

    /** The shell the profile would have. */
    candidate: EffectiveShell;

    /** The screen templates the plan was worked out with: what applying it needs to move the screens built from them. */
    templates: ScreenTemplate[];

    /** Scene's plan: where each slot's content goes, what is lost, what stops the switch. */
    plan: ShellSwitchPlan;

    /** The settings the switch would store. */
    settings: UiProfileSettings;
}

/**
 * Works out switching the application's shell to a template. The plan is `planShellSwitch`'s; this resolves the two shells the plan compares - the candidate
 * against the packages the application has now, so a blueprint it lacks is something the plan says it would add - and the settings the switch would store.
 *
 * @param settings The current settings.
 * @param template The template to switch to.
 * @param context What the switch is worked out against.
 * @param remaps The author's choices for the slots that need one.
 * @returns The switch.
 */
export function planSwitchTo(settings: UiProfileSettings, template: TemplateReference, context: ShellSwitchContext, remaps: SlotRemaps = {}): ShellSwitch {
    const current = effectiveShellOf(settings, context);
    const next = withRootTemplate(settings, template, context.bundles);
    const candidate = effectiveShellOf(next, context, resolveUiProfile(settings, context.bundles).selection.packages);
    const templates = placeableScreenTemplates(resolveUiProfile(settings, context.bundles).profile, { library: context.library, screens: context.screens });
    return { current, candidate, templates, plan: planShellSwitch(current, candidate, context.screens, templates, remaps), settings: next };
}
