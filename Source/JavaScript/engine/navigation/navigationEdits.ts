// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationLogo, NavigationModel, Outlet, OutletItem, OutletItemKind, OutletMode, OutletNavigationItem, OutletRefinement } from '@cratis/scene.model';
import { outletItemKinds } from '../outlets/outletItemKinds';
import { NavigationEdit } from './NavigationEdit';
import { NavigationEditKind } from './NavigationEditKind';
import { NavigationEditOutcome } from './NavigationEditOutcome';
import { NavigationEditPlan } from './NavigationEditPlan';
import {
    allowsSubItems,
    childrenOf,
    collectItemIds,
    findApplicationOutlet,
    findModuleNavigation,
    modeOfModuleOutlet,
    ownOutletItems,
    standardNavigationOutlets,
} from './navigationOutlets';

const noMode = 'The application is the base of the navigation and has no outlet mode.';
const logoLevel = 'The logo is defined at the application level only.';
const needsOutlet = 'A navigation edit names the outlet it changes.';
const unknownOutlet = (outlet: string): string => `There is no outlet '${outlet}' to edit.`;
const flat = (outlet: string): string => `The ${outlet} is flat; its items have no sub-items.`;
const kindMismatch = (outlet: Outlet, item: OutletItem): string => `The outlet '${outlet.name}' lists ${outlet.kind} and does not take a ${item.kind} item.`;
const duplicateId = (id: string): string => `Item id '${id}' is already used in this outlet.`;
const missingParent = (parent: string): string => `There is no item '${parent}' to add a sub-item to.`;
const missingItem = (id: string): string => `There is no item '${id}' in this outlet.`;
const inheritedItem = (id: string): string => `Item '${id}' is inherited from the application; edit it there.`;
const intoItself = (id: string): string => `Item '${id}' cannot become a sub-item of itself.`;
const noTitle = (id: string): string => `Item '${id}' has no title to rename.`;

/** Where an item sits among the items a level puts in an outlet. */
interface Location {
    siblings: OutletItem[];
    index: number;
    parent?: string;
}

/**
 * Plans switching how a module treats an outlet it inherits. Going back to `inherits` drops the module's refinement of
 * the outlet - its own items and what it hides. Going from `inherits` to `overrides` with `copy` starts the module's
 * items from a copy of the application's.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application, which is refused since it has no mode.
 * @param outlet The outlet, such as `sidebar`.
 * @param mode The mode to switch to.
 * @param options Whether to copy the application's items when switching from `inherits` to `overrides`.
 * @returns The edits, or why the switch is refused.
 */
export function switchOutletMode(
    navigation: NavigationModel,
    module: string | undefined,
    outlet: string,
    mode: OutletMode,
    options: { copy?: boolean } = {},
): NavigationEditPlan {
    if (module === undefined) return { edits: [], rejected: noMode };
    const declared = findApplicationOutlet(navigation, outlet);
    if (!declared) return { edits: [], rejected: unknownOutlet(outlet) };
    const current = modeOfModuleOutlet(navigation, module, outlet);
    if (current === mode) return { edits: [] };
    const setMode: NavigationEdit = { kind: NavigationEditKind.SetOutletMode, module, outlet, mode };
    if (mode === OutletMode.Overrides && current === OutletMode.Inherits && options.copy === true) {
        return { edits: [{ kind: NavigationEditKind.SetOutletItems, module, outlet, items: structuredClone(declared.defaults) }, setMode] };
    }
    return { edits: [setMode] };
}

/**
 * Plans adding an item - or a sub-item of one of the level's own items - to an outlet. Adding to an outlet a module
 * inherits switches the module to `extends` first, so the application's items stay.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param outlet The outlet, such as `sidebar` or `topbarButtons`.
 * @param item The item to add.
 * @param parent The id of the item it becomes a sub-item of; undefined for a top-level item.
 * @param index The position among its siblings; after the ones already there when undefined.
 * @returns The edits, or why the add is refused.
 */
export function addNavigationItem(
    navigation: NavigationModel,
    module: string | undefined,
    outlet: string,
    item: OutletItem,
    parent?: string,
    index?: number,
): NavigationEditPlan {
    const declared = findApplicationOutlet(navigation, outlet);
    if (!declared) return { edits: [], rejected: unknownOutlet(outlet) };
    if (!outletItemKinds(declared.kind).includes(item.kind)) return { edits: [], rejected: kindMismatch(declared, item) };
    const nested = allowsSubItems(outlet, declared.kind);
    if (parent !== undefined && !nested) return { edits: [], rejected: flat(outlet) };
    const ids = collectItemIds(ownOutletItems(navigation, module, outlet), nested);
    if (ids.includes(item.id)) return { edits: [], rejected: duplicateId(item.id) };
    if (parent !== undefined && !ids.includes(parent)) return { edits: [], rejected: missingParent(parent) };

    const add: NavigationEdit = { kind: NavigationEditKind.AddItem, module, outlet, item: structuredClone(item) };
    if (parent !== undefined) add.parent = parent;
    if (index !== undefined) add.index = index;
    if (module !== undefined && modeOfModuleOutlet(navigation, module, outlet) === OutletMode.Inherits) {
        return { edits: [{ kind: NavigationEditKind.SetOutletMode, module, outlet, mode: OutletMode.Extends }, add] };
    }
    return { edits: [add] };
}

/**
 * Plans renaming one of the items a level puts in an outlet itself. An item the module inherits is renamed where it is
 * defined: the application.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param outlet The outlet.
 * @param id The id of the item.
 * @param title The new title.
 * @returns The edits, or why the rename is refused.
 */
export function renameNavigationItem(navigation: NavigationModel, module: string | undefined, outlet: string, id: string, title: string): NavigationEditPlan {
    const declared = findApplicationOutlet(navigation, outlet);
    if (!declared) return { edits: [], rejected: unknownOutlet(outlet) };
    const location = locate(ownOutletItems(navigation, module, outlet), id, allowsSubItems(outlet, declared.kind));
    if (!location) return { edits: [], rejected: missingOrInherited(navigation, module, declared, id) };
    const found = location.siblings[location.index];
    if (!('title' in found)) return { edits: [], rejected: noTitle(id) };
    return { edits: [{ kind: NavigationEditKind.UpdateItem, module, outlet, id, item: { ...structuredClone(found), title } }] };
}

/**
 * Plans moving one of the items a level puts in an outlet itself: to another position among its siblings, or under
 * another of the level's items.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param outlet The outlet.
 * @param id The id of the item.
 * @param to Where it goes: the id of its new parent (undefined for the top level) and its position among its new siblings (the end when undefined).
 * @returns The edits, or why the move is refused.
 */
export function moveNavigationItem(
    navigation: NavigationModel,
    module: string | undefined,
    outlet: string,
    id: string,
    to: { parent?: string; index?: number },
): NavigationEditPlan {
    const declared = findApplicationOutlet(navigation, outlet);
    if (!declared) return { edits: [], rejected: unknownOutlet(outlet) };
    const nested = allowsSubItems(outlet, declared.kind);
    const own = ownOutletItems(navigation, module, outlet);
    const location = locate(own, id, nested);
    if (!location) return { edits: [], rejected: missingOrInherited(navigation, module, declared, id) };
    if (to.parent !== undefined) {
        if (!nested) return { edits: [], rejected: flat(outlet) };
        const moved = location.siblings[location.index];
        if (to.parent === id || collectItemIds(childrenOf(moved), true).includes(to.parent)) return { edits: [], rejected: intoItself(id) };
        if (!collectItemIds(own, true).includes(to.parent)) return { edits: [], rejected: missingParent(to.parent) };
    }
    const move: NavigationEdit = { kind: NavigationEditKind.MoveItem, module, outlet, id };
    if (to.parent !== undefined) move.parent = to.parent;
    if (to.index !== undefined) move.index = to.index;
    return { edits: [move] };
}

/**
 * Plans duplicating one of the items a level puts in an outlet itself. The copy goes right after the item and gets
 * fresh ids - `<id>-copy`, numbered when that is taken - for itself and every sub-item.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param outlet The outlet.
 * @param id The id of the item.
 * @param newId The id of the copy; a fresh one when undefined.
 * @returns The edits, or why the duplicate is refused.
 */
export function duplicateNavigationItem(navigation: NavigationModel, module: string | undefined, outlet: string, id: string, newId?: string): NavigationEditPlan {
    const declared = findApplicationOutlet(navigation, outlet);
    if (!declared) return { edits: [], rejected: unknownOutlet(outlet) };
    const own = ownOutletItems(navigation, module, outlet);
    const location = locate(own, id, allowsSubItems(outlet, declared.kind));
    if (!location) return { edits: [], rejected: missingOrInherited(navigation, module, declared, id) };
    const used = new Set(collectItemIds(own, true));
    if (newId !== undefined && used.has(newId)) return { edits: [], rejected: duplicateId(newId) };

    const copy = copyWithFreshIds(location.siblings[location.index], used, newId);
    delete copy.before;
    delete copy.after;
    const add: NavigationEdit = { kind: NavigationEditKind.AddItem, module, outlet, item: copy };
    if (location.parent !== undefined) add.parent = location.parent;
    add.index = location.index + 1;
    return { edits: [add] };
}

/**
 * Plans removing an item. One of the level's own items is removed with its sub-items; an item a module inherits from
 * the application is hidden instead - switching the module to `extends` first when it inherits the outlet.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param outlet The outlet.
 * @param id The id of the item.
 * @returns The edits, or why the removal is refused.
 */
export function removeNavigationItem(navigation: NavigationModel, module: string | undefined, outlet: string, id: string): NavigationEditPlan {
    const declared = findApplicationOutlet(navigation, outlet);
    if (!declared) return { edits: [], rejected: unknownOutlet(outlet) };
    if (locate(ownOutletItems(navigation, module, outlet), id, allowsSubItems(outlet, declared.kind))) {
        return { edits: [{ kind: NavigationEditKind.RemoveItem, module, outlet, id }] };
    }
    if (module === undefined) return { edits: [], rejected: missingItem(id) };
    const mode = modeOfModuleOutlet(navigation, module, outlet);
    if (mode === OutletMode.Overrides || !declared.defaults.some(item => item.id === id)) {
        return { edits: [], rejected: missingOrInherited(navigation, module, declared, id) };
    }
    const hide: NavigationEdit = { kind: NavigationEditKind.HideItem, module, outlet, id };
    return { edits: mode === OutletMode.Inherits ? [{ kind: NavigationEditKind.SetOutletMode, module, outlet, mode: OutletMode.Extends }, hide] : [hide] };
}

/**
 * Plans setting the application logo; it is defined at the application level only.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param logo The logo.
 * @returns The edits, or why the change is refused.
 */
export function setApplicationLogo(navigation: NavigationModel, module: string | undefined, logo: ApplicationLogo): NavigationEditPlan {
    void navigation;
    return module === undefined ? { edits: [{ kind: NavigationEditKind.SetLogo, logo: { ...logo } }] } : { edits: [], rejected: logoLevel };
}

/**
 * Applies navigation edits. Either every edit applies, or none does and the model given comes back unchanged; the model
 * given is never changed.
 * @param navigation The navigation model.
 * @param edits The edits, in order.
 * @returns Whether they applied, the model afterwards, and why they were refused.
 */
export function applyNavigationEdits(navigation: NavigationModel, edits: NavigationEdit[]): NavigationEditOutcome {
    const model = structuredClone(navigation);
    for (const edit of edits) {
        const rejected = apply(model, edit);
        if (rejected !== undefined) return { applied: false, model: navigation, rejected };
    }
    return { applied: true, model };
}

function missingOrInherited(navigation: NavigationModel, module: string | undefined, declared: Outlet, id: string): string {
    if (module === undefined || modeOfModuleOutlet(navigation, module, declared.name) === OutletMode.Overrides) return missingItem(id);
    return locate(declared.defaults, id, true) ? inheritedItem(id) : missingItem(id);
}

function locate(items: OutletItem[], id: string, nested: boolean, parent?: string): Location | undefined {
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (item.id === id) return parent === undefined ? { siblings: items, index } : { siblings: items, index, parent };
        if (nested) {
            const found = locate(childrenOf(item), id, nested, item.id);
            if (found) return found;
        }
    }
    return undefined;
}

function freshId(base: string, used: Set<string>): string {
    let candidate = base;
    for (let number = 2; used.has(candidate); number++) candidate = `${base}-${number}`;
    used.add(candidate);
    return candidate;
}

function copyWithFreshIds(item: OutletItem, used: Set<string>, id?: string): OutletItem {
    const copy = structuredClone(item);
    copy.id = id ?? freshId(`${item.id}-copy`, used);
    if (id !== undefined) used.add(id);
    if (copy.kind === OutletItemKind.Navigation && copy.children !== undefined) {
        copy.children = copy.children.map(child => copyWithFreshIds(child, used) as OutletNavigationItem);
    }
    return copy;
}

function applicationOutletOf(model: NavigationModel, outlet: string): Outlet | undefined {
    model.application.outlets ??= [];
    const declared = model.application.outlets.find(candidate => candidate.name === outlet);
    if (declared) return declared;
    const standard = standardNavigationOutlets().find(candidate => candidate.name === outlet);
    if (standard) model.application.outlets.push(standard);
    return standard;
}

function refinementOf(model: NavigationModel, module: string, outlet: string): OutletRefinement {
    let block = findModuleNavigation(model, module);
    if (!block) {
        block = { module };
        model.modules.push(block);
    }
    block.refinements ??= [];
    let found = block.refinements.find(refinement => refinement.outlet === outlet);
    if (!found) {
        found = { outlet };
        block.refinements.push(found);
    }
    return found;
}

function ownListOf(model: NavigationModel, module: string | undefined, outlet: string): OutletItem[] | undefined {
    if (module === undefined) return applicationOutletOf(model, outlet)?.defaults;
    if (!findApplicationOutlet(model, outlet)) return undefined;
    const refinement = refinementOf(model, module, outlet);
    refinement.items ??= [];
    return refinement.items;
}

function insert(siblings: OutletItem[], item: OutletItem, index: number | undefined): void {
    const at = index === undefined ? siblings.length : Math.max(0, Math.min(index, siblings.length));
    siblings.splice(at, 0, item);
}

function apply(model: NavigationModel, edit: NavigationEdit): string | undefined {
    if (edit.kind === NavigationEditKind.SetLogo) {
        if (edit.module !== undefined) return logoLevel;
        model.application.logo = { ...edit.logo! };
        return undefined;
    }
    if (!Object.values(NavigationEditKind).includes(edit.kind)) return `'${String(edit.kind)}' is not a navigation edit.`;
    if (edit.outlet === undefined) return needsOutlet;
    const outlet = edit.outlet;
    const declared = findApplicationOutlet(model, outlet);
    if (!declared) return unknownOutlet(outlet);
    const nested = allowsSubItems(outlet, declared.kind);

    switch (edit.kind) {
        case NavigationEditKind.SetOutletMode: {
            if (edit.module === undefined) return noMode;
            if (edit.mode === OutletMode.Inherits) {
                const block = findModuleNavigation(model, edit.module);
                if (block?.refinements) {
                    block.refinements = block.refinements.filter(refinement => refinement.outlet !== outlet);
                    if (block.refinements.length === 0) delete block.refinements;
                }
                return undefined;
            }
            refinementOf(model, edit.module, outlet).mode = edit.mode;
            return undefined;
        }
        case NavigationEditKind.SetOutletItems: {
            const items = structuredClone(edit.items ?? []);
            if (edit.module === undefined) applicationOutletOf(model, outlet)!.defaults = items;
            else refinementOf(model, edit.module, outlet).items = items;
            return undefined;
        }
        case NavigationEditKind.AddItem: {
            const own = ownListOf(model, edit.module, outlet)!;
            const item = structuredClone(edit.item!);
            if (!outletItemKinds(declared.kind).includes(item.kind)) return kindMismatch(declared, item);
            if (collectItemIds(own, nested).includes(item.id)) return duplicateId(item.id);
            if (edit.parent === undefined) {
                insert(own, item, edit.index);
                return undefined;
            }
            if (!nested || item.kind !== OutletItemKind.Navigation) return flat(outlet);
            const owner = locate(own, edit.parent, nested);
            if (!owner) return missingParent(edit.parent);
            const parentItem = owner.siblings[owner.index] as OutletNavigationItem;
            parentItem.children ??= [];
            insert(parentItem.children, item, edit.index);
            return undefined;
        }
        case NavigationEditKind.UpdateItem: {
            const location = locate(ownListOf(model, edit.module, outlet)!, edit.id ?? '', nested);
            if (!location) return missingItem(edit.id ?? '');
            location.siblings[location.index] = structuredClone(edit.item!);
            return undefined;
        }
        case NavigationEditKind.MoveItem: {
            const own = ownListOf(model, edit.module, outlet)!;
            const location = locate(own, edit.id ?? '', nested);
            if (!location) return missingItem(edit.id ?? '');
            const [moved] = location.siblings.splice(location.index, 1);
            if (edit.parent === undefined) {
                insert(own, moved, edit.index);
                return undefined;
            }
            if (!nested || moved.kind !== OutletItemKind.Navigation) return flat(outlet);
            const owner = locate(own, edit.parent, nested);
            if (!owner) return missingParent(edit.parent);
            const parentItem = owner.siblings[owner.index] as OutletNavigationItem;
            parentItem.children ??= [];
            insert(parentItem.children, moved, edit.index);
            return undefined;
        }
        case NavigationEditKind.RemoveItem: {
            const location = locate(ownListOf(model, edit.module, outlet)!, edit.id ?? '', nested);
            if (!location) return missingItem(edit.id ?? '');
            location.siblings.splice(location.index, 1);
            return undefined;
        }
        case NavigationEditKind.HideItem: {
            if (edit.module === undefined) return noMode;
            const refinement = refinementOf(model, edit.module, outlet);
            refinement.hide ??= [];
            if (!refinement.hide.includes(edit.id ?? '')) refinement.hide.push(edit.id ?? '');
            return undefined;
        }
        default:
            return `'${String((edit as NavigationEdit).kind)}' is not a navigation edit.`;
    }
}
