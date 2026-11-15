// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { PackageEditKind } from '../../UiProfile/PackageEditKind';
import type { ApplicationTemplate } from '../../ScreenTemplates/ApplicationTemplate';
import type { ProfileBlocker } from '../../UiProfile/ProfileBlocker';
import type { ProfileUsage } from '../../UiProfile/ProfileUsage';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { findProfileBlockers } from '../../UiProfile/findProfileBlockers';
import { toggleTemplatePack } from '../../UiProfile/toggleTemplatePack';
import { togglePackage } from '../../UiProfile/togglePackage';
import { PackageRemovalKind, type PackageRemovalPlan } from './PackageRemoval';

const keyOf = (blocker: ProfileBlocker) => `${blocker.kind}|${blocker.subject}|${blocker.detail ?? ''}|${blocker.found ?? ''}`;

// Removing a package, or stopping to offer a blueprint's templates, is worked out with the same rules the save applies: what the resolver keeps
// (a package another one needs stays), and what the profile would newly break (`findProfileBlockers` on the result, less what was already broken).
export function planPackageRemoval(settings: UiProfileSettings, name: string, isTemplatePack: boolean, bundles: ScenePackageBundle[], usages: ProfileUsage[], applicationTemplates: ApplicationTemplate[] = []): PackageRemovalPlan {
    const fixed: PackageRemovalPlan = { kind: PackageRemovalKind.Fixed, settings, requiredBy: [], blockers: [] };
    if (name === corePackage) return fixed;

    const outcome = isTemplatePack ? toggleTemplatePack(settings, name, bundles) : togglePackage(settings, name, bundles);
    if (outcome.kind === PackageEditKind.Blocked || outcome.kind === PackageEditKind.Unchanged) return fixed;
    if (outcome.kind === PackageEditKind.RemovedButStillRequired) return { kind: PackageRemovalKind.StillRequired, settings: outcome.settings, requiredBy: outcome.requiredBy, blockers: [] };

    const existing = new Set(findProfileBlockers(settings, bundles, usages, applicationTemplates).map(keyOf));
    const blockers = findProfileBlockers(outcome.settings, bundles, usages, applicationTemplates).filter(blocker => !existing.has(keyOf(blocker)));
    return blockers.length > 0
        ? { kind: PackageRemovalKind.Breaks, settings, requiredBy: [], blockers }
        : { kind: PackageRemovalKind.Allowed, settings: outcome.settings, requiredBy: [], blockers: [] };
}
