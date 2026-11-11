// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage, Theme, UiProfile } from '@cratis/scene.model';
import { resolvePackageDependencies } from '../resolvePackageDependencies';
import { EffectiveShell } from '../shell/EffectiveShell';
import { ShellDiagnosticCode } from '../shell/ShellDiagnosticCode';
import { TemplateLibrary } from '../templates/TemplateLibrary';
import { incompatiblePackages } from '../themeCompatibility';
import { ProfileBlocker } from './ProfileBlocker';
import { ProblemSeverity } from './ProblemSeverity';
import { ProfileBlockerCode } from './ProfileBlockerCode';
import { ProfileSection } from './ProfileSection';
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

/** The section of the designer each problem belongs to. */
export const sectionOf: Record<ProfileBlockerCode, ProfileSection> = {
    [ProfileBlockerCode.MissingDependency]: ProfileSection.Packages,
    [ProfileBlockerCode.VersionConflict]: ProfileSection.Packages,
    [ProfileBlockerCode.DependencyCycle]: ProfileSection.Packages,
    [ProfileBlockerCode.ThemeIncompatible]: ProfileSection.Look,
    [ProfileBlockerCode.DefaultScreenTemplateUnavailable]: ProfileSection.Shell,
    [ProfileBlockerCode.UsedLayoutUnavailable]: ProfileSection.Packages,
    [ProfileBlockerCode.UsedScreenTemplateUnavailable]: ProfileSection.Packages,
    [ProfileBlockerCode.UsedDialogTemplateUnavailable]: ProfileSection.Packages,
    [ProfileBlockerCode.UsedSlotUnavailable]: ProfileSection.Packages,
    [ProfileBlockerCode.ShellUnusable]: ProfileSection.Shell,
    [ProfileBlockerCode.ThemeNeedsPackage]: ProfileSection.Look,
    [ProfileBlockerCode.AccentTooLight]: ProfileSection.Look,
    [ProfileBlockerCode.OwnShellHasNoValue]: ProfileSection.Shell,
    [ProfileBlockerCode.LogoImageMissing]: ProfileSection.App,
    [ProfileBlockerCode.RevealNeedsHover]: ProfileSection.Menu,
};

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
    const vocabulary = vocabularyOf(profile, context.library);
    const blockers: UnclassifiedBlocker[] = [
        ...dependencyBlockers(profile, context),
        ...shellBlockers(context),
        ...themeBlockers(profile, context),
        ...defaultTemplateBlockers(profile, vocabulary),
        ...(context.usages ?? []).flatMap(usage => usageBlockers(profile.name, usage, vocabulary)),
    ];

    return blockers.map(blocker => ({ ...blocker, severity: ProblemSeverity.Blocker, section: sectionOf[blocker.code] }));
}

type UnclassifiedBlocker = Omit<ProfileBlocker, 'severity' | 'section'>;

function dependencyBlockers(profile: UiProfile, context: ProfileBlockerContext): UnclassifiedBlocker[] {
    const selection = resolvePackageDependencies(profile.packages, [...context.packages]);
    return [
        ...selection.missing.map(missing => ({ code: ProfileBlockerCode.MissingDependency, subject: missing.dependsOn, message: `Package '${missing.package}' needs '${missing.dependsOn}', which is not available` })),
        ...selection.versionConflicts.map(conflict => ({
            code: ProfileBlockerCode.VersionConflict,
            subject: conflict.dependsOn,
            message: `Package '${conflict.package}' needs '${conflict.dependsOn}' ${conflict.requiredRange}, but version ${conflict.actualVersion} is what is available`,
        })),
        ...selection.cycles.map(cycle => ({ code: ProfileBlockerCode.DependencyCycle, subject: cycle.join(' → '), message: `Packages depend on each other in a circle: ${cycle.join(' → ')}` })),
    ];
}

const shellBlockers = (context: ProfileBlockerContext): UnclassifiedBlocker[] =>
    (context.shell?.diagnostics ?? [])
        .filter(diagnostic => unusableShell.has(diagnostic.code))
        .map(diagnostic => ({ code: ProfileBlockerCode.ShellUnusable, subject: diagnostic.subject ?? context.shell!.name, message: diagnostic.message, shellCode: diagnostic.code }));

function themeBlockers(profile: UiProfile, context: ProfileBlockerContext): UnclassifiedBlocker[] {
    if (context.theme === undefined) return [];
    const missing = incompatiblePackages(context.theme, profile);
    return missing.length === 0
        ? []
        : [{
            code: ProfileBlockerCode.ThemeIncompatible,
            subject: context.theme.name,
            message: `Theme '${context.theme.name}' is not marked compatible with ${missing.map(item => `'${item}'`).join(', ')}, which profile '${profile.name}' uses`,
        }];
}

function defaultTemplateBlockers(profile: UiProfile, vocabulary: Vocabulary): UnclassifiedBlocker[] {
    const defaultTemplate = profile.defaults?.newScreenTemplate;
    return defaultTemplate !== undefined && !vocabulary.screenTemplates.has(defaultTemplate.id)
        ? [{
            code: ProfileBlockerCode.DefaultScreenTemplateUnavailable,
            subject: defaultTemplate.id,
            message: `Screen template '${defaultTemplate.id}', the default for new screens of profile '${profile.name}', is not provided by the application or its packages`,
        }]
        : [];
}

function usageBlockers(profileName: string, usage: ProfileUsage, vocabulary: Vocabulary): UnclassifiedBlocker[] {
    return [
        ...unavailable(usage.layouts, vocabulary.layouts, ProfileBlockerCode.UsedLayoutUnavailable, item => `Screen '${usage.screen}' uses layout '${item}', which the packages of profile '${profileName}' do not provide`),
        ...unavailable(usage.screenTemplates, vocabulary.screenTemplates, ProfileBlockerCode.UsedScreenTemplateUnavailable, item => `Screen '${usage.screen}' uses screen template '${item}', which the packages of profile '${profileName}' do not provide`),
        ...unavailable(usage.dialogTemplates, vocabulary.dialogTemplates, ProfileBlockerCode.UsedDialogTemplateUnavailable, item => `Screen '${usage.screen}' uses dialog template '${item}', which the packages of profile '${profileName}' do not provide`),
        ...usage.slots
            .filter(({ owner, slot }) => slotsOf(vocabulary, owner)?.includes(slot) === false)
            .map(({ owner, slot }) => ({ code: ProfileBlockerCode.UsedSlotUnavailable, subject: `${owner}.${slot}`, message: `Screen '${usage.screen}' places content in slot '${slot}' of '${owner}', which no longer has it` })),
    ];
}

const unavailable = (used: readonly string[], provided: Map<string, string[]>, code: ProfileBlockerCode, message: (item: string) => string): UnclassifiedBlocker[] =>
    used.filter(item => !provided.has(item)).map(item => ({ code, subject: item, message: message(item) }));

const slotsOf = (vocabulary: Vocabulary, owner: string): string[] | undefined =>
    vocabulary.layouts.get(owner) ?? vocabulary.screenTemplates.get(owner) ?? vocabulary.dialogTemplates.get(owner);

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
        addAll(vocabulary.layouts, source.layouts);
        addAll(vocabulary.screenTemplates, source.screenTemplates);
        addAll(vocabulary.dialogTemplates, source.dialogTemplates);
    }

    return vocabulary;
}

function addAll(target: Map<string, string[]>, items: readonly { name: string; slots: readonly { name: string }[] }[] | undefined): void {
    for (const item of items ?? []) {
        if (!target.has(item.name)) target.set(item.name, item.slots.map(slot => slot.name));
    }
}
