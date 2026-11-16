// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formatMessage } from '../../UiProfile/formatMessage';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import type { ProfileProblem } from './ProfileProblem';

// What is wrong with the profile as it stands, from the same resolver every consumer uses. The designer only owns where each finding is shown:
// the engine diagnostics from Scene are added here as they are published, each on the node that owns it.
export function findProfileProblems(settings: UiProfileSettings, resolved: ResolvedUiProfile, strings: UiProfileDesignerStrings): ProfileProblem[] {
    const problems: ProfileProblem[] = [];
    problems.push(...describePackageProblems(resolved, strings));
    if (settings.shell.length === 0 && settings.root === undefined) problems.push({ code: 'rootTemplateUnknown', severity: 'warning', message: strings.problems.noShell, node: ProfileNodeKind.Shell });
    return problems;
}

// Why the package selection is not valid, as the engine found it: each missing dependency, version conflict and cycle on its own, with the packages
// named as a person knows them. Only when the engine says the selection is invalid and gives no reason is the general sentence used.
function describePackageProblems(resolved: ResolvedUiProfile, strings: UiProfileDesignerStrings): ProfileProblem[] {
    if (resolved.isValid) return [];

    const names = new Map(resolved.entries.map(entry => [entry.name, entry.displayName]));
    const nameOf = (id: string) => names.get(id) ?? id;
    const { missing, versionConflicts, cycles } = resolved.selection;
    const text = strings.problems;
    const found: ProfileProblem[] = [
        ...missing.map(item => ({ code: 'profilePackageMissing', severity: 'error' as const, node: ProfileNodeKind.Packages,
            message: formatMessage(text.packageMissing, { package: nameOf(item.package), dependsOn: nameOf(item.dependsOn) }) })),
        ...versionConflicts.map(item => ({ code: 'profilePackageVersionConflict', severity: 'error' as const, node: ProfileNodeKind.Packages,
            message: formatMessage(text.packageVersionConflict, { package: nameOf(item.package), dependsOn: nameOf(item.dependsOn), required: item.requiredRange, actual: item.actualVersion }) })),
        ...cycles.map(cycle => ({ code: 'profilePackageCycle', severity: 'error' as const, node: ProfileNodeKind.Packages,
            message: formatMessage(text.packageCycle, { packages: cycle.map(nameOf).join(' → ') }) })),
    ];
    return found.length > 0 ? found : [{ code: 'profilePackageMissing', severity: 'error', message: text.packageSelectionInvalid, node: ProfileNodeKind.Packages }];
}
