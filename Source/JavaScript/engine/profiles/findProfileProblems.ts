// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LogoKind, ScenePackage, TargetSizeClass, TemplateReferenceSource, UiProfile } from '@cratis/scene.model';
import { contrastAgainstWhite, minimumAccentContrast } from './contrast';
import { findProfileBlockers, ProfileBlockerContext, sectionOf } from './findProfileBlockers';
import { addPackage } from './packageList';
import { ProblemSeverity } from './ProblemSeverity';
import { ProfileBlocker } from './ProfileBlocker';
import { ProfileBlockerCode } from './ProfileBlockerCode';
import { ProfileFix, ProfileFixKind } from './ProfileFix';
import { NavigationMode, normalizeNavigationMode } from './shellOptions';

/**
 * Finds everything worth telling the author about a profile: the blockers first (`findProfileBlockers`), then the warnings and information the
 * profile can be applied with. Each one carries its severity, the section it belongs to and, when there is one, the fix a host offers as one
 * undoable edit. No problem is computed in a host (REN2).
 *
 * Removing a package never changes the theme: a theme that needed the package becomes `themeNeedsPackage`, and the profile stays as chosen.
 *
 * @param profile The profile.
 * @param context What it is checked against.
 * @returns The problems, blockers first.
 */
export function findProfileProblems(profile: UiProfile, context: ProfileBlockerContext): ProfileBlocker[] {
    const problems = findProfileBlockers(profile, context);

    const theme = profile.theme ?? context.theme?.name;
    if (theme !== undefined) {
        const suppliers = context.packages.filter(candidate => candidate.themes.includes(theme));
        if (suppliers.length > 0 && !suppliers.some(supplier => profile.packages.includes(supplier.name))) {
            const supplier = suppliers[0];
            problems.push({
                code: ProfileBlockerCode.ThemeNeedsPackage, subject: theme, severity: ProblemSeverity.Warning, section: sectionOf[ProfileBlockerCode.ThemeNeedsPackage],
                message: `Theme '${theme}' comes from '${supplier.name}', which is not in the package list`,
                fix: { kind: ProfileFixKind.AddPackage, label: 'Add package', package: supplier.name },
            });
        }
    }

    const accent = profile.appearance?.accent;
    if (accent !== undefined && accent !== '') {
        const contrast = contrastAgainstWhite(accent);
        if (contrast.valid && contrast.ratio! < minimumAccentContrast) {
            problems.push({
                code: ProfileBlockerCode.AccentTooLight, subject: accent, severity: ProblemSeverity.Warning, section: sectionOf[ProfileBlockerCode.AccentTooLight],
                message: `Accent ${accent} is too light for white button text (${contrast.ratio!.toFixed(2)}:1; it needs at least ${minimumAccentContrast}:1)`,
                fix: { kind: ProfileFixKind.UseThemeAccent, label: 'Use theme accent' },
            });
        }
    }

    const template = profile.root?.template;
    if (template !== undefined && template.source === TemplateReferenceSource.Own && template.id.trim() === '') {
        problems.push({
            code: ProfileBlockerCode.OwnShellHasNoValue, subject: 'root', severity: ProblemSeverity.Warning, section: sectionOf[ProfileBlockerCode.OwnShellHasNoValue],
            message: 'My own shell is chosen but names nothing; enter a package name or a path',
            fix: { kind: ProfileFixKind.UseDefaultBlueprint, label: 'Use default blueprint' },
        });
    }

    const logo = profile.identity?.logo;
    if (logo?.kind === LogoKind.Image && (logo.image ?? '') === '') {
        problems.push({
            code: ProfileBlockerCode.LogoImageMissing, subject: 'logo', severity: ProblemSeverity.Warning, section: sectionOf[ProfileBlockerCode.LogoImageMissing],
            message: 'The logo is an image, but no image is chosen',
            fix: { kind: ProfileFixKind.UseInitials, label: 'Use initials' },
        });
    }

    if (profile.defaultSizeClass === TargetSizeClass.Compact && normalizeNavigationMode(profile.root?.options?.navigationMode) === NavigationMode.Reveal) {
        problems.push({
            code: ProfileBlockerCode.RevealNeedsHover, subject: 'navigationMode', severity: ProblemSeverity.Info, section: sectionOf[ProfileBlockerCode.RevealNeedsHover],
            message: 'Reveal needs a pointer that can hover, so a touch screen shows a drawer instead',
            fix: { kind: ProfileFixKind.SwitchToDrawer, label: 'Switch to Drawer' },
        });
    }

    return problems;
}

/**
 * Applies a problem's fix. One function for every host, so the same fix gives the same profile in C# and TypeScript.
 *
 * @param profile The profile.
 * @param fix The fix.
 * @param catalog Every package that could be selected; `addPackage` needs it.
 * @returns The profile after the fix.
 */
export function applyProfileFix(profile: UiProfile, fix: ProfileFix, catalog: readonly ScenePackage[]): UiProfile {
    switch (fix.kind) {
        case ProfileFixKind.AddPackage:
            return fix.package === undefined ? profile : addPackage(profile, catalog, fix.package).profile;
        case ProfileFixKind.UseThemeAccent: {
            if (profile.appearance === undefined) return profile;
            const { accent: _accent, ...appearance } = profile.appearance;
            return { ...profile, appearance };
        }
        case ProfileFixKind.UseDefaultBlueprint: {
            const { root: _root, ...rest } = profile;
            return rest;
        }
        case ProfileFixKind.UseInitials:
            return { ...profile, identity: { ...profile.identity, logo: { ...profile.identity?.logo, kind: LogoKind.Initials } } };
        case ProfileFixKind.SwitchToDrawer:
            return profile.root === undefined ? profile : { ...profile, root: { ...profile.root, options: { ...profile.root.options, navigationMode: NavigationMode.Drawer } } };
        default:
            return profile;
    }
}
