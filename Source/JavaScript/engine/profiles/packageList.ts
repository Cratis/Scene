// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage, TemplateReference, TemplateReferenceSource, UiProfile } from '@cratis/scene.model';
import { corePackage } from '../resolveComponentName';
import { pinOf } from './migrateLegacyProfile';

/*
 * The package list of a UI profile, the way a designer shows it.
 *
 * `UiProfile.packages` is stored in ascending priority: the first entry is the weakest, the last wins a shared component name, and `core` is the
 * final fallback every name resolves against. A designer lists the strongest first, so its *position 1* is the end of the stored list and `core`
 * is always its last row. Everything here speaks in the designer's order (rows, up, down) and writes the stored order.
 *
 * A package that depends on another is always stronger than it (it comes later in the stored list); every edit keeps that true.
 */

/** Why a package is in the list. */
export enum PackageReasonKind {
    /** The author added it, or a theme or blueprint choice added it on the author's behalf. */
    Chosen = 'chosen',

    /** Another listed package depends on it. */
    NeededBy = 'neededBy',

    /** It is the blueprint of the current shell. */
    UsedByShell = 'usedByShell',

    /** It is `core`: the final fallback, always last. */
    AlwaysLast = 'alwaysLast',
}

/** Why a package cannot be removed. */
export enum PackageLockKind {
    /** `core` can never be removed or moved. */
    Core = 'core',

    /** Another listed package needs it. */
    NeededBy = 'neededBy',

    /** It is the blueprint of the current shell. */
    Shell = 'shell',
}

/** The reason line of a package. */
export interface PackageReason {
    kind: PackageReasonKind;

    /** For `neededBy`: the display names of the packages that need it, in list order. */
    packages: string[];

    /** The line to show: `Chosen`, `Needed by A, B`, `Used by Shell` or `Always last`. */
    text: string;
}

/** Why a package cannot be removed, with a sentence for the lock's tooltip. */
export interface PackageLock {
    kind: PackageLockKind;
    packages: string[];
    text: string;
}

/** One row of the package list. */
export interface PackageRow {
    /** 1 is the strongest package: the one that wins when two supply the same component. */
    position: number;
    name: string;
    displayName: string;
    version: string;
    kind: PackageKind;
    description?: string;
    reason: PackageReason;
    canMoveUp: boolean;
    canMoveDown: boolean;

    /** Present when the package cannot be removed. */
    lock?: PackageLock;
}

/** A package that is not in the list, with what adding it would also add. */
export interface AddablePackage {
    name: string;
    displayName: string;
    version: string;
    kind: PackageKind;
    description?: string;

    /** The packages that would be added with it, display names, dependencies first and excluding itself. */
    alsoAdds: string[];

    /** A sentence for the list: empty when nothing else is added, otherwise `Also adds A, B`. */
    text: string;
}

/** Who supplies a component name. */
export interface ComponentSupplier {
    component: string;

    /** The strongest package in the list that supplies it. */
    winner: string;

    /** The other listed packages that also supply it, strongest first. */
    others: string[];
}

/** The answer a package list needs: rows, addable packages and who supplies what. */
export interface PackageList {
    rows: PackageRow[];
    addable: AddablePackage[];
    suppliers: ComponentSupplier[];
}

/** What an edit did. */
export enum PackageEditOutcome {
    Added = 'added',
    Removed = 'removed',
    Moved = 'moved',
    Changed = 'changed',

    /** Nothing to do: the package is already there, or the move would change nothing. */
    Unchanged = 'unchanged',

    /** The rules do not allow it. `message` says why, with real names. */
    Refused = 'refused',
}

/** The result of an edit: the profile after it (the same profile when nothing changed) and what happened. */
export interface PackageEdit {
    profile: UiProfile;
    outcome: PackageEditOutcome;

    /** The packages the edit added, dependencies first. */
    added: string[];

    /** The packages the edit removed. */
    removed: string[];

    /** A sentence with real names, ready for a status line. Empty when there is nothing to say. */
    message: string;
}

/** The direction of a move in the designer's list. */
export enum MoveDirection {
    Up = 'up',
    Down = 'down',
}

/** The blueprint package of the profile's current shell, when its root template is a blueprint template. */
export function shellBlueprintOf(profile: UiProfile): string | undefined {
    const template = profile.root?.template;
    return template?.source === TemplateReferenceSource.Blueprint ? template.blueprint : undefined;
}

const nameOf = (scenePackage: ScenePackage | undefined, fallback: string) => scenePackage?.displayName ?? scenePackage?.name ?? fallback;

/** The stored list with `core` at the front. */
function storedOf(profile: UiProfile): string[] {
    return profile.packages.includes(corePackage) ? [...profile.packages] : [corePackage, ...profile.packages];
}

function dependenciesOf(name: string, index: Map<string, ScenePackage>): string[] {
    return [...new Set((index.get(name)?.dependencies ?? []).map(dependency => dependency.name))];
}

/** Whether every package comes after the packages it depends on. */
function isOrdered(stored: readonly string[], index: Map<string, ScenePackage>): boolean {
    return stored.every((name, position) => dependenciesOf(name, index).every(dependency => !stored.includes(dependency) || stored.indexOf(dependency) < position));
}

/** Everything `name` needs that is not in `listed`, dependencies first. Undefined names are reported in `unknown`. */
function closureOf(name: string, listed: ReadonlySet<string>, index: Map<string, ScenePackage>): { order: string[]; unknown: string[] } {
    const order: string[] = [];
    const unknown: string[] = [];
    const visiting = new Set<string>();
    const visit = (current: string) => {
        if (listed.has(current) || order.includes(current) || visiting.has(current)) return;
        if (!index.has(current)) {
            if (!unknown.includes(current)) unknown.push(current);
            return;
        }

        visiting.add(current);
        for (const dependency of dependenciesOf(current, index)) visit(dependency);
        visiting.delete(current);
        order.push(current);
    };

    visit(name);
    return { order, unknown };
}

/**
 * Inserts packages just above `core` - the weakest place that is not the fallback - or, when a dependency of theirs sits higher in the stored list, just
 * after the last of them so every package still comes after what it needs.
 */
function insertAboveCore(stored: string[], order: readonly string[], index: Map<string, ScenePackage>): string[] {
    const coreAt = stored.indexOf(corePackage);
    let at = coreAt + 1;
    for (const name of order) {
        for (const dependency of dependenciesOf(name, index)) {
            const found = stored.indexOf(dependency);
            if (found >= at) at = found + 1;
        }
    }

    return [...stored.slice(0, at), ...order, ...stored.slice(at)];
}

/** Writes the stored list back; `core` stays out of a profile that did not list it, because it is the implicit fallback. */
function withPackages(profile: UiProfile, packages: string[]): UiProfile {
    return { ...profile, packages: profile.packages.includes(corePackage) ? packages : packages.filter(name => name !== corePackage) };
}

const unchanged = (profile: UiProfile, message = ''): PackageEdit => ({ profile, outcome: PackageEditOutcome.Unchanged, added: [], removed: [], message });
const refused = (profile: UiProfile, message: string): PackageEdit => ({ profile, outcome: PackageEditOutcome.Refused, added: [], removed: [], message });

/**
 * Describes the package list of a profile: the rows in the designer's order with reasons, move and removal rules, the packages that can be added
 * with what each would also add, and who supplies every component.
 *
 * @param profile The profile.
 * @param catalog Every package that could be listed.
 * @returns The rows, the addable packages and the supplier table.
 */
export function describePackageList(profile: UiProfile, catalog: readonly ScenePackage[]): PackageList {
    const index = new Map(catalog.map(item => [item.name, item]));
    const stored = storedOf(profile);
    const names = [...stored].reverse();
    const shell = shellBlueprintOf(profile);

    const needers = (name: string) => names.filter(other => other !== name && dependenciesOf(other, index).includes(name));

    const rows = names.map((name, at): PackageRow => {
        const item = index.get(name);
        const needed = needers(name).map(other => nameOf(index.get(other), other));
        const shellName = nameOf(item, name);
        let reason: PackageReason;
        let lock: PackageLock | undefined;
        if (name === corePackage) {
            reason = { kind: PackageReasonKind.AlwaysLast, packages: [], text: 'Always last' };
            lock = { kind: PackageLockKind.Core, packages: [], text: `${shellName} is the fallback every component name resolves against, so it is always last and cannot be removed.` };
        } else if (name === shell) {
            reason = { kind: PackageReasonKind.UsedByShell, packages: [], text: 'Used by Shell' };
            lock = { kind: PackageLockKind.Shell, packages: [], text: `${shellName} is the blueprint of the current shell, so it stays while it is the shell.` };
        } else if (needed.length > 0) {
            reason = { kind: PackageReasonKind.NeededBy, packages: needed, text: `Needed by ${needed.join(', ')}` };
            lock = { kind: PackageLockKind.NeededBy, packages: needed, text: `${shellName} is needed by ${needed.join(', ')}, so it stays while they are listed.` };
        } else {
            reason = { kind: PackageReasonKind.Chosen, packages: [], text: 'Chosen' };
        }

        const canMoveUp = name !== corePackage && at > 0 && moveIsValid(stored, name, MoveDirection.Up, index);
        const canMoveDown = name !== corePackage && at < names.length - 1 && moveIsValid(stored, name, MoveDirection.Down, index);
        return {
            position: at + 1,
            name,
            displayName: nameOf(item, name),
            version: item?.version ?? '',
            kind: item?.kind ?? PackageKind.ComponentLibrary,
            ...(item?.description === undefined ? {} : { description: item.description }),
            reason,
            canMoveUp,
            canMoveDown,
            ...(lock === undefined ? {} : { lock }),
        };
    });

    const listed = new Set(stored);
    const addable = catalog.filter(item => !listed.has(item.name)).map((item): AddablePackage => {
        const alsoAdds = closureOf(item.name, listed, index).order.filter(name => name !== item.name).map(name => nameOf(index.get(name), name));
        return {
            name: item.name,
            displayName: nameOf(item, item.name),
            version: item.version,
            kind: item.kind,
            ...(item.description === undefined ? {} : { description: item.description }),
            alsoAdds,
            text: alsoAdds.length === 0 ? '' : `Also adds ${alsoAdds.join(', ')}`,
        };
    });

    const byComponent = new Map<string, string[]>();
    for (const name of names) {
        for (const component of index.get(name)?.components ?? []) {
            const suppliers = byComponent.get(component) ?? [];
            if (!suppliers.includes(name)) suppliers.push(name);
            byComponent.set(component, suppliers);
        }
    }

    const suppliers = [...byComponent.entries()]
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([component, supplying]): ComponentSupplier => ({ component, winner: supplying[0], others: supplying.slice(1) }));

    return { rows, addable, suppliers };
}

/** Who supplies a component name in the list, or undefined when no listed package does. */
export function findSupplier(list: PackageList, component: string): ComponentSupplier | undefined {
    return list.suppliers.find(supplier => supplier.component === component);
}

function moveIsValid(stored: readonly string[], name: string, direction: MoveDirection, index: Map<string, ScenePackage>): boolean {
    const at = stored.indexOf(name);
    // Up in the designer is later in the stored list.
    const other = direction === MoveDirection.Up ? at + 1 : at - 1;
    if (at < 0 || other < 0 || other >= stored.length || stored[other] === corePackage || name === corePackage) return false;
    const next = [...stored];
    [next[at], next[other]] = [next[other], next[at]];
    return isOrdered(next, index);
}

/**
 * Adds a package and everything it depends on, just above `core`.
 *
 * @param profile The profile.
 * @param catalog Every package that could be listed.
 * @param name The package to add.
 * @returns The edit; refused when the package or something it needs is not in the catalog.
 */
export function addPackage(profile: UiProfile, catalog: readonly ScenePackage[], name: string): PackageEdit {
    const index = new Map(catalog.map(item => [item.name, item]));
    const stored = storedOf(profile);
    if (stored.includes(name)) return unchanged(profile);
    if (!index.has(name)) return refused(profile, `Package '${name}' is not available.`);

    const { order, unknown } = closureOf(name, new Set(stored), index);
    if (unknown.length > 0) return refused(profile, `Package '${nameOf(index.get(name), name)}' needs ${unknown.map(item => `'${item}'`).join(', ')}, which ${unknown.length === 1 ? 'is' : 'are'} not available.`);

    const added = order.map(item => nameOf(index.get(item), item));
    return {
        profile: withPackages(profile, insertAboveCore(stored, order, index)),
        outcome: PackageEditOutcome.Added,
        added: order,
        removed: [],
        message: added.length === 1 ? `Added ${added[0]}.` : `Added ${nameOf(index.get(name), name)} with ${added.filter(item => item !== nameOf(index.get(name), name)).join(', ')}.`,
    };
}

/**
 * Removes a package. `core`, a package another listed package needs and the blueprint of the current shell cannot be removed; the answer names why.
 * The theme is never touched: a theme that needed the package becomes a problem the engine reports, not a silent change.
 *
 * @param profile The profile.
 * @param catalog Every package that could be listed.
 * @param name The package to remove.
 * @returns The edit.
 */
export function removePackage(profile: UiProfile, catalog: readonly ScenePackage[], name: string): PackageEdit {
    const index = new Map(catalog.map(item => [item.name, item]));
    const stored = storedOf(profile);
    if (!stored.includes(name)) return unchanged(profile);

    const row = describePackageList(profile, catalog).rows.find(candidate => candidate.name === name)!;
    if (row.lock !== undefined) return refused(profile, row.lock.text);

    return {
        profile: withPackages(profile, stored.filter(candidate => candidate !== name)),
        outcome: PackageEditOutcome.Removed,
        added: [],
        removed: [name],
        message: `Removed ${nameOf(index.get(name), name)}.`,
    };
}

/**
 * Moves a package one row up or down in the designer's list.
 *
 * @param profile The profile.
 * @param catalog Every package that could be listed.
 * @param name The package to move.
 * @param direction Up makes it stronger.
 * @returns The edit; refused when `core` is moved or the move would put a package below one it depends on or past `core`.
 */
export function movePackage(profile: UiProfile, catalog: readonly ScenePackage[], name: string, direction: MoveDirection): PackageEdit {
    const index = new Map(catalog.map(item => [item.name, item]));
    const stored = storedOf(profile);
    if (!stored.includes(name)) return unchanged(profile);
    if (name === corePackage) return refused(profile, `${nameOf(index.get(name), name)} is always last and cannot be moved.`);
    if (!moveIsValid(stored, name, direction, index)) return unchanged(profile);

    const at = stored.indexOf(name);
    const other = direction === MoveDirection.Up ? at + 1 : at - 1;
    const next = [...stored];
    [next[at], next[other]] = [next[other], next[at]];
    return { profile: withPackages(profile, next), outcome: PackageEditOutcome.Moved, added: [], removed: [], message: `Moved ${nameOf(index.get(name), name)} ${direction}.` };
}

/**
 * Chooses the blueprint of the shell: the blueprint package moves to position 1 (the strongest), the previous shell blueprint leaves the list when
 * nothing else needs it, and the root template becomes the blueprint's shell.
 *
 * @param profile The profile.
 * @param catalog Every package that could be listed.
 * @param blueprint The blueprint package to choose.
 * @param shell The blueprint template that is the shell; absent, the blueprint's first layout.
 * @returns The edit; refused when the package is not a blueprint, or has no shell to offer.
 */
export function chooseBlueprint(profile: UiProfile, catalog: readonly ScenePackage[], blueprint: string, shell?: string): PackageEdit {
    const index = new Map(catalog.map(item => [item.name, item]));
    const scenePackage = index.get(blueprint);
    if (scenePackage === undefined || scenePackage.kind !== PackageKind.Blueprint) return refused(profile, `Package '${blueprint}' is not a blueprint.`);
    const shellId = shell ?? scenePackage.layouts[0];
    if (shellId === undefined) return refused(profile, `${nameOf(scenePackage, blueprint)} has no shell to offer.`);

    let stored = storedOf(profile);
    const previous = shellBlueprintOf(profile);
    const removed: string[] = [];
    if (previous !== undefined && previous !== blueprint && stored.includes(previous)) {
        const needed = stored.some(other => other !== previous && dependenciesOf(other, index).includes(previous));
        if (!needed) {
            stored = stored.filter(candidate => candidate !== previous);
            removed.push(previous);
        }
    }

    const { order, unknown } = closureOf(blueprint, new Set(stored), index);
    if (unknown.length > 0) return refused(profile, `${nameOf(scenePackage, blueprint)} needs ${unknown.map(item => `'${item}'`).join(', ')}, which ${unknown.length === 1 ? 'is' : 'are'} not available.`);
    const added = order.filter(item => item !== blueprint);
    stored = insertAboveCore(stored, added, index);

    const dependedOn = stored.some(other => other !== blueprint && dependenciesOf(other, index).includes(blueprint));
    if (stored.includes(blueprint)) {
        if (!dependedOn) stored = [...stored.filter(candidate => candidate !== blueprint), blueprint];
    } else {
        stored = [...stored, blueprint];
        added.push(blueprint);
    }

    const version = pinOf(scenePackage.version);
    const template: TemplateReference = { source: TemplateReferenceSource.Blueprint, id: shellId, blueprint, ...(version === undefined ? {} : { version }) };
    const next: UiProfile = { ...withPackages(profile, stored), root: { ...profile.root, template } };
    return { profile: next, outcome: PackageEditOutcome.Changed, added, removed, message: `Shell set to ${nameOf(scenePackage, blueprint)}.` };
}

/**
 * Chooses a theme. When the theme comes from a package that is not listed, the package is added with what it needs.
 *
 * @param profile The profile.
 * @param catalog Every package that could be listed.
 * @param theme The name of the theme.
 * @returns The edit.
 */
export function chooseTheme(profile: UiProfile, catalog: readonly ScenePackage[], theme: string): PackageEdit {
    const supplier = catalog.find(item => item.themes.includes(theme));
    const listed = storedOf(profile).includes(supplier?.name ?? '');
    const base: UiProfile = { ...profile, theme };
    if (supplier === undefined || listed) {
        return { profile: base, outcome: profile.theme === theme ? PackageEditOutcome.Unchanged : PackageEditOutcome.Changed, added: [], removed: [], message: '' };
    }

    const added = addPackage(base, catalog, supplier.name);
    return added.outcome === PackageEditOutcome.Added
        ? { ...added, outcome: PackageEditOutcome.Changed, message: `Theme '${theme}' needs ${nameOf(supplier, supplier.name)}, which was added.` }
        : { ...added, profile: base, outcome: PackageEditOutcome.Changed };
}
