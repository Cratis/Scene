// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toComponentCatalog } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';
import { ProfileBlocker } from './ProfileBlocker';
import { ProfileBlockerKind } from './ProfileBlockerKind';
import { ProfileUsage } from './ProfileUsage';
import { ProfileVocabulary } from './ProfileVocabulary';
import { ApplicationTemplate } from '../ScreenTemplates/ApplicationTemplate';
import { TemplateReferenceKind } from '../ScreenTemplates/TemplateReferenceKind';
import { buildTemplateCatalog } from '../ScreenTemplates/buildTemplateCatalog';
import { applicableTemplatesAt, isTemplateApplicable } from '../ScreenTemplates/applicableTemplatesAt';
import { TemplateLevel } from '../ScreenTemplates/TemplateLevel';
import { parseTemplateReference } from '../ScreenTemplates/parseTemplateReference';
import { ResolvedUiProfile } from './ResolvedUiProfile';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';
import { vocabularyOf } from './vocabularyOf';
import { resolveStoredComponentName } from '../ScreenEditor/Runtime/storedComponentName';

/**
 * Finds everything that stops the draft from being applied.
 *
 * The first group is the profile itself: dependencies that cannot be met, a shell that is missing or has
 * no layout, a theme the packages cannot use, a default screen template nothing provides. The second is
 * the profile's effect on what exists: every layout, template, slot and component an authored screen uses
 * must still be supplied. Nothing is replaced or dropped silently - an unsatisfied use is a blocker the
 * user resolves first, which is also why applying never rewrites a screen.
 *
 * @param draft The settings that would be applied.
 * @param bundles Every known package bundle.
 * @param usages What existing screens rely on.
 * @param applicationTemplates The templates built for the application, which are valid as the default too.
 * @returns The blockers, empty when the draft can be applied.
 */
export function findProfileBlockers(draft: UiProfileSettings, bundles: ScenePackageBundle[], usages: ProfileUsage[], applicationTemplates: ApplicationTemplate[] = []): ProfileBlocker[] {
    const resolved = resolveUiProfile(draft, bundles);
    const vocabulary = vocabularyOf(resolved.selection.packages, bundles);

    return [
        ...dependencyBlockers(resolved),
        ...shellBlockers(draft, resolved, bundles),
        ...visualBlockers(draft, resolved, vocabulary, bundles, applicationTemplates),
        ...usageBlockers(resolved, vocabulary, bundles, usages),
    ];
}

function dependencyBlockers(resolved: ResolvedUiProfile): ProfileBlocker[] {
    const { selection } = resolved;
    return [
        ...selection.missing.map(missing => ({ kind: ProfileBlockerKind.MissingDependency, subject: missing.dependsOn, detail: missing.package })),
        ...selection.versionConflicts.map(conflict => ({
            kind: ProfileBlockerKind.VersionConflict,
            subject: conflict.dependsOn,
            detail: `${conflict.package} ${conflict.requiredRange}`,
            found: conflict.actualVersion,
        })),
        ...selection.cycles.map(cycle => ({ kind: ProfileBlockerKind.DependencyCycle, subject: cycle.join(' → ') })),
    ];
}

function shellBlockers(draft: UiProfileSettings, resolved: ResolvedUiProfile, bundles: ScenePackageBundle[]): ProfileBlocker[] {
    // An application's own template as the root needs no blueprint: whether it can be the shell is Scene's to say (the Shell node lists it).
    if (draft.root !== undefined && draft.shell.length === 0) return [];
    if (draft.shell.length === 0 || !bundles.some(bundle => bundle.manifest.name === draft.shell)) {
        return [{ kind: ProfileBlockerKind.NoShell, subject: draft.shell }];
    }

    return resolved.layout.length === 0 ? [{ kind: ProfileBlockerKind.ShellSuppliesNoLayout, subject: draft.shell }] : [];
}

function visualBlockers(draft: UiProfileSettings, resolved: ResolvedUiProfile, vocabulary: ProfileVocabulary, bundles: ScenePackageBundle[], applicationTemplates: ApplicationTemplate[]): ProfileBlocker[] {
    const blockers: ProfileBlocker[] = [];
    if (draft.theme.length > 0 && !resolved.compatibleThemes.some(theme => theme.name === draft.theme)) {
        blockers.push({ kind: ProfileBlockerKind.ThemeIncompatible, subject: draft.theme });
    }

    blockers.push(...defaultTemplateBlockers(draft, resolved, vocabulary, bundles, applicationTemplates));
    return blockers;
}

function defaultTemplateBlockers(draft: UiProfileSettings, resolved: ResolvedUiProfile, vocabulary: ProfileVocabulary, bundles: ScenePackageBundle[], applicationTemplates: ApplicationTemplate[]): ProfileBlocker[] {
    const reference = parseTemplateReference(draft.defaultScreenTemplate);
    if (!reference) return [];

    const subject = draft.defaultScreenTemplate;
    if (reference.kind === TemplateReferenceKind.Application) {
        return applicationTemplates.some(template => template.id.toLowerCase() === reference.id.toLowerCase()) ? [] : [{ kind: ProfileBlockerKind.DefaultScreenTemplateUnavailable, subject }];
    }

    if (!vocabulary.screenTemplates.has(reference.id)) return [{ kind: ProfileBlockerKind.DefaultScreenTemplateUnavailable, subject }];

    const catalog = buildTemplateCatalog(resolved, bundles);
    const fits = isTemplateApplicable(applicableTemplatesAt({ level: TemplateLevel.Application, chain: [], reference }, catalog), reference);
    return fits ? [] : [{ kind: ProfileBlockerKind.DefaultScreenTemplateIncompatible, subject }];
}

function usageBlockers(resolved: ResolvedUiProfile, vocabulary: ProfileVocabulary, bundles: ScenePackageBundle[], usages: ProfileUsage[]): ProfileBlocker[] {
    const catalog = toComponentCatalog(bundles.map(bundle => bundle.manifest));

    return usages.flatMap(usage => {
        const blocker = (kind: ProfileBlockerKind, subject: string): ProfileBlocker => ({ kind, subject, detail: usage.screen });
        const slotOwner = (owner: string) => vocabulary.layouts.get(owner) ?? vocabulary.screenTemplates.get(owner) ?? vocabulary.dialogTemplates.get(owner);

        return [
            ...usage.layouts.filter(name => !vocabulary.layouts.has(name)).map(name => blocker(ProfileBlockerKind.UsedLayoutUnavailable, name)),
            ...usage.screenTemplates.filter(name => !vocabulary.screenTemplates.has(name)).map(name => blocker(ProfileBlockerKind.UsedScreenTemplateUnavailable, name)),
            ...usage.dialogTemplates.filter(name => !vocabulary.dialogTemplates.has(name)).map(name => blocker(ProfileBlockerKind.UsedDialogTemplateUnavailable, name)),
            ...usage.components
                .filter(name => resolveStoredComponentName(name, resolved.profile, catalog) === undefined)
                .map(name => blocker(ProfileBlockerKind.UsedComponentUnavailable, name)),
            ...usage.slots
                .filter(({ owner, slot }) => slotOwner(owner) !== undefined && !slotOwner(owner)!.includes(slot))
                .map(({ owner, slot }) => blocker(ProfileBlockerKind.UsedSlotUnavailable, `${owner}.${slot}`)),
        ];
    });
}
