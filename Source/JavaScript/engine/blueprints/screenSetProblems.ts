// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintSource } from './BlueprintSource';

type ScreenSetEntry = { name: string; title?: string; template?: string; parent?: string };

interface ScreenSetScope {
    source: BlueprintSource;
    label: string;
    names: Set<string>;
    availableTemplates: Set<string>;
}

/**
 * The rules for the ready-to-use screen set of a domain blueprint: named once, titled, built on available templates, parented inside the set and never its own ancestor.
 *
 * @param source The blueprint.
 * @param label How the blueprint is named in a problem.
 * @param availableTemplates The names of the screen templates available to it.
 * @returns The problems.
 */
export function screenSetProblems(source: BlueprintSource, label: string, availableTemplates: Set<string>): string[] {
    const set: ScreenSetEntry[] = source.manifest.blueprint!.screenSet ?? [];
    if (set.length === 0) return [`${label} declares no ready-to-use screen set`];

    const names = new Set<string>();
    const problems = nameProblems(label, set, names);
    const scope: ScreenSetScope = { source, label, names, availableTemplates };
    for (const screen of set) {
        if (!isBlank(screen.name)) problems.push(...entryProblems(scope, screen));
    }

    for (const screen of set) {
        if (hasOwnAncestor(screen, names, set)) problems.push(`${label} screen '${screen.name}' is its own ancestor`);
    }

    return problems;
}

function isBlank(value: string | undefined): boolean {
    return (value ?? '').trim() === '';
}

function nameProblems(label: string, set: ScreenSetEntry[], names: Set<string>): string[] {
    const problems: string[] = [];
    for (const screen of set) {
        if (isBlank(screen.name)) {
            problems.push(`${label} declares a screen set entry without a name`);
            continue;
        }

        if (names.has(screen.name)) problems.push(`${label} declares screen '${screen.name}' more than once`);
        names.add(screen.name);
    }

    return problems;
}

function entryProblems(scope: ScreenSetScope, screen: ScreenSetEntry): string[] {
    const problems: string[] = [];
    const owner = `${scope.label} screen '${screen.name}'`;
    if (isBlank(screen.title)) problems.push(`${owner} declares no title`);
    if (screen.template !== undefined && !scope.availableTemplates.has(screen.template)) problems.push(`${owner} uses template '${screen.template}', which is not available`);
    if (screen.parent !== undefined && !scope.names.has(screen.parent)) problems.push(`${owner} has parent '${screen.parent}', which is not in the screen set`);
    if (scope.source.screens !== undefined && !scope.source.screens.some(candidate => candidate.name === screen.name)) problems.push(`${owner} is named in the screen set but the package does not provide it`);
    return problems;
}

function hasOwnAncestor(screen: ScreenSetEntry, names: Set<string>, set: ScreenSetEntry[]): boolean {
    return screen.parent !== undefined && names.has(screen.parent) && isOwnAncestor(screen.name, set);
}

function isOwnAncestor(name: string, set: ScreenSetEntry[]): boolean {
    const visited = new Set<string>();
    for (let current = set.find(screen => screen.name === name)?.parent; current !== undefined; current = set.find(screen => screen.name === current)?.parent) {
        if (current === name) return true;
        if (visited.has(current)) return false;
        visited.add(current);
    }

    return false;
}
