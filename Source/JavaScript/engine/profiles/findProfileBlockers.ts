// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage, Theme, UiProfile } from '@cratis/scene.model';
import { resolvePackageDependencies } from '../resolvePackageDependencies';
import { EffectiveShell } from '../shell/EffectiveShell';
import { ShellDiagnosticCode } from '../shell/ShellDiagnosticCode';
import { TemplateLibrary } from '../templates/TemplateLibrary';
import { incompatiblePackages } from '../themeCompatibility';
import { ProfileBlocker } from './ProfileBlocker';
import { ProfileBlockerCode } from './ProfileBlockerCode';
import { ProfileUsage } from './ProfileUsage';

/** What a profile is checked against. */
export interface ProfileBlockerContext {
    /** Every package that could be selected; the dependency rules read their manifests. */
    packages: readonly ScenePackage[];

    /** The application's own templates and the blueprints that are available. */
    library: TemplateLibrary;

    /** The theme the profile names, when it is known. Absent, the theme is not checked. */
    theme?: Theme;

    /** The shell the profile resolves to (`resolveEffectiveShell`). Its unusable-shell diagnostics become blockers. */
    shell?: EffectiveShell;

    /** What existing screens rely on. */
    usages?: readonly ProfileUsage[];
}

const unusableShell = new Set<ShellDiagnosticCode>([
    ShellDiagnosticCode.RootTemplateUnknown,
    ShellDiagnosticCode.RootTemplateVersionNotSatisfied,
    ShellDiagnosticCode.RootTemplateNotApplicable,
    ShellDiagnosticCode.RootTemplateMissingContentSlot,
    ShellDiagnosticCode.RootTemplateCycle,
]);

/**
 * Finds everything that stops a profile from being applied. The one place these rules live (REN2); Studio presents the result.
 *
 * The first group is the profile itself: dependencies that cannot be met, a shell that cannot be the shell, a theme the packages cannot use, a
 * default screen template nothing provides. The second is the profile's effect on what exists: every layout, template and slot an authored
 * screen uses must still be supplied. Nothing is replaced or dropped silently - an unsatisfied use is a blocker the user resolves first.
 * Every message names what it is about; none shows an id or a placeholder.
 *
 * @param profile The profile that would be applied.
 * @param context What it is checked against.
 * @returns The blockers, empty when the profile can be applied.
 */
export function findProfileBlockers(profile: UiProfile, context: ProfileBlockerContext): ProfileBlocker[] {
    const blockers: ProfileBlocker[] = [];
    const name = profile.name;

    const selection = resolvePackageDependencies(profile.packages, [...context.packages]);
    for (const missing of selection.missing) {
        blockers.push({ code: ProfileBlockerCode.MissingDependency, subject: missing.dependsOn, message: `Package '${missing.package}' needs '${missing.dependsOn}', which is not available` });
    }

    for (const conflict of selection.versionConflicts) {
        blockers.push({
            code: ProfileBlockerCode.VersionConflict,
            subject: conflict.dependsOn,
            message: `Package '${conflict.package}' needs '${conflict.dependsOn}' ${conflict.requiredRange}, but version ${conflict.actualVersion} is what is available`,
        });
    }

    for (const cycle of selection.cycles) {
        blockers.push({ code: ProfileBlockerCode.DependencyCycle, subject: cycle.join(' → '), message: `Packages depend on each other in a circle: ${cycle.join(' → ')}` });
    }

    for (const diagnostic of context.shell?.diagnostics ?? []) {
        if (unusableShell.has(diagnostic.code)) {
            blockers.push({ code: ProfileBlockerCode.ShellUnusable, subject: diagnostic.subject ?? context.shell!.name, message: diagnostic.message, shellCode: diagnostic.code });
        }
    }

    if (context.theme !== undefined) {
        const missing = incompatiblePackages(context.theme, profile);
        if (missing.length > 0) {
            blockers.push({
                code: ProfileBlockerCode.ThemeIncompatible,
                subject: context.theme.name,
                message: `Theme '${context.theme.name}' is not marked compatible with ${missing.map(item => `'${item}'`).join(', ')}, which profile '${name}' uses`,
            });
        }
    }

    const vocabulary = vocabularyOf(profile, context.library);
    const defaultTemplate = profile.defaults?.newScreenTemplate;
    if (defaultTemplate !== undefined && !vocabulary.screenTemplates.has(defaultTemplate.id)) {
        blockers.push({
            code: ProfileBlockerCode.DefaultScreenTemplateUnavailable,
            subject: defaultTemplate.id,
            message: `Screen template '${defaultTemplate.id}', the default for new screens of profile '${name}', is not provided by the application or its packages`,
        });
    }

    for (const usage of context.usages ?? []) {
        for (const layout of usage.layouts.filter(item => !vocabulary.layouts.has(item))) {
            blockers.push({ code: ProfileBlockerCode.UsedLayoutUnavailable, subject: layout, message: `Screen '${usage.screen}' uses layout '${layout}', which the packages of profile '${name}' do not provide` });
        }

        for (const template of usage.screenTemplates.filter(item => !vocabulary.screenTemplates.has(item))) {
            blockers.push({ code: ProfileBlockerCode.UsedScreenTemplateUnavailable, subject: template, message: `Screen '${usage.screen}' uses screen template '${template}', which the packages of profile '${name}' do not provide` });
        }

        for (const template of usage.dialogTemplates.filter(item => !vocabulary.dialogTemplates.has(item))) {
            blockers.push({ code: ProfileBlockerCode.UsedDialogTemplateUnavailable, subject: template, message: `Screen '${usage.screen}' uses dialog template '${template}', which the packages of profile '${name}' do not provide` });
        }

        for (const { owner, slot } of usage.slots) {
            const slots = vocabulary.layouts.get(owner) ?? vocabulary.screenTemplates.get(owner) ?? vocabulary.dialogTemplates.get(owner);
            if (slots !== undefined && !slots.includes(slot)) {
                blockers.push({ code: ProfileBlockerCode.UsedSlotUnavailable, subject: `${owner}.${slot}`, message: `Screen '${usage.screen}' places content in slot '${slot}' of '${owner}', which no longer has it` });
            }
        }
    }

    return blockers;
}

interface Vocabulary {
    layouts: Map<string, string[]>;
    screenTemplates: Map<string, string[]>;
    dialogTemplates: Map<string, string[]>;
}

/** The layouts and templates the application and the profile's installed blueprints provide, with their slots. The application's own win a shared name. */
function vocabularyOf(profile: UiProfile, library: TemplateLibrary): Vocabulary {
    const vocabulary: Vocabulary = { layouts: new Map(), screenTemplates: new Map(), dialogTemplates: new Map() };
    const installed = library.blueprints.filter(candidate => profile.packages.includes(candidate.manifest.name));
    for (const source of [library.own, ...installed]) {
        if (source === undefined) continue;
        for (const layout of source.layouts ?? []) if (!vocabulary.layouts.has(layout.name)) vocabulary.layouts.set(layout.name, layout.slots.map(slot => slot.name));
        for (const template of source.screenTemplates ?? []) if (!vocabulary.screenTemplates.has(template.name)) vocabulary.screenTemplates.set(template.name, template.slots.map(slot => slot.name));
        for (const template of source.dialogTemplates ?? []) if (!vocabulary.dialogTemplates.has(template.name)) vocabulary.dialogTemplates.set(template.name, template.slots.map(slot => slot.name));
    }

    return vocabulary;
}
