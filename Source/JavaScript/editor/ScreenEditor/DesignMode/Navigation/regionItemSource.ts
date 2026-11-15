// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind, OutletItemKind, OutletMode, PropertyValueType, ValueSource, type ApplicationStructure, type InspectedProperty, type NavigationModel, type OutletNavigationItem } from '@cratis/scene.model';
import { NavigationEditKind, addNavigationItem, diagnoseNavigationOutlets, effectiveNavigation, switchOutletMode, type EffectiveNavItem, type NavigationEditPlan } from '@cratis/scene.engine';
import { inheritedReasonRule } from '../designModeRules';
import { DesignModeItemSourceKind, designModeActions, type DesignModeChoice, type DesignModeItem, type DesignModeItemSource, type DesignModePlan, type DesignModeRejection } from '../designModeTypes';
import { changeItem, duplicateItem, findItem, moveItem, removeItem, siblingsOf } from './navigationItemOps';
import { ownItemsOf } from './navigationDocument';

export interface RegionSourceInputs {
    region: NavigationRegionKind;

    // The module being edited; nothing for the application level, which defines what modules inherit.
    module: string | undefined;
    navigation: NavigationModel;
    structure: ApplicationStructure;
    newId: () => string;

    // The slots of the layout an item may render into, for Scene's `navSlotUnknown` finding.
    slots: readonly string[];
    startingLabel: string;
    strings: RegionStrings;
}

export interface RegionStrings {

    // What the region says it is made of: the tag on the region, and its long form for the tooltip (NAV13).
    tagLong: (region: NavigationRegionKind, sources: string) => string;
    extendsNotice: string;
    overrideHere: string;
    editAtApplication: string;
    application: string;
    mainArea: string;
}

// The mode of a module's outlet of navigation as the region tag says it.
const modeOf = (mode: OutletMode | undefined): 'inherit' | 'extend' | 'override' | undefined =>
    mode === OutletMode.Inherits ? 'inherit' : mode === OutletMode.Extends ? 'extend' : mode === OutletMode.Overrides ? 'override' : undefined;

// The name of what an item leads to, as the author reads it: `Sales › Orders`, or `Sales` for a module (which opens its first feature).
export function targetLabel(structure: ApplicationStructure, target: { module?: string; feature?: string } | undefined): string | undefined {
    if (!target?.module) return undefined;
    const module = structure.modules.find(candidate => candidate.id === target.module);
    if (!module) return target.module;
    if (!target.feature) return module.name;
    const names: string[] = [];
    let features = module.features;
    for (const segment of target.feature.split('.')) {
        const found = features.find(candidate => candidate.id === segment);
        names.push(found?.name ?? segment);
        features = found?.features ?? [];
    }
    return [module.name, ...names].join(' › ');
}

// The items of the topbar or the sidebar - the application's outlets of navigation - as Scene resolves them for the module being edited - inherited ones
// read-only, the module's own editable - and what each action does to them. The rules are Scene's: `effectiveNavigation` says what is shown and why,
// `switchOutletMode`/`addNavigationItem` plan the edits that change the mode (NAV3-NAV6), `diagnoseNavigationOutlets` says what is wrong. What the editor adds is
// the plain list operations on the items a level owns, as `setOutletItems` edits.
export function createRegionItemSource(inputs: RegionSourceInputs): DesignModeItemSource {
    const { region, module, navigation, structure, newId, slots, startingLabel, strings } = inputs;
    const effective = effectiveNavigation(structure, navigation, module, region);
    const own = ownItemsOf(navigation, module, region);
    const problems = diagnoseNavigationOutlets(structure, navigation, { slots: [...slots] });
    const entry = (id: string) => `${module ?? 'application'}:${region}:${id}`;

    const items: DesignModeItem[] = [];
    const visit = (level: EffectiveNavItem[], parentId?: string) => {
        const ownLevel = level.filter(candidate => !candidate.readOnly);
        level.forEach(item => {
            const authored = findItem(own, item.id);
            const target = authored?.target ?? (item.target ? { module: item.target.module, ...(item.target.feature ? { feature: item.target.feature } : {}) } : undefined);
            const index = item.readOnly ? -1 : ownLevel.indexOf(item);
            const label = targetLabel(structure, target);
            const found = problems.filter(problem => problem.entry === entry(item.id)).map(problem => ({ code: problem.code, message: problem.message }));
            items.push({
                id: item.id,
                label: item.title,
                index,
                count: ownLevel.length,
                ...(parentId ? { parentId } : {}),
                readOnly: item.readOnly,
                ...(item.readOnly ? { readOnlyReason: inheritedReasonRule, origin: strings.application } : {}),
                values: { target, slot: item.slot, icon: item.icon, children: item.children?.length },
                chips: { target: label ?? '', slot: item.slot === 'content' || item.slot === '' ? strings.mainArea : item.slot },
                ...(found.length > 0 ? { problems: found } : {}),
                unlinked: target === undefined && !(item.children && item.children.length > 0),
            });
            if (item.children) visit(item.children, item.id);
        });
    };
    visit(effective.items);

    const kindOfRegion = region as 'topbar' | 'sidebar';
    const plan = (label: string, edits: NavigationEditPlan, select?: DesignModePlan['select'], more: Partial<DesignModePlan> = {}): DesignModePlan | DesignModeRejection =>
        edits.rejected ? { rejected: edits.rejected } : { label, edits: [], navigationEdits: edits.edits, ...(select ? { select } : {}), ...more };

    const replace = (next: OutletNavigationItem[]): NavigationEditPlan => ({ edits: [{ kind: NavigationEditKind.SetOutletItems, ...(module !== undefined ? { module } : {}), outlet: region, items: next }] });

    const add = (parent?: string): DesignModePlan | DesignModeRejection => {
        const id = newId();
        const planned = addNavigationItem(navigation, module, region, { kind: OutletItemKind.Navigation, id, title: startingLabel }, parent);
        const switched = planned.edits.some(edit => edit.kind === NavigationEditKind.SetOutletMode);
        return plan('Add', planned, { itemId: id }, { renameNext: true, ...(switched ? { notice: strings.extendsNotice } : {}) });
    };

    return {
        kind: DesignModeItemSourceKind.Region,
        items,
        regionTag: { text: effective.sources.label, long: strings.tagLong(region, effective.sources.label), kind: effective.sources.kind },
        region: { region: kindOfRegion, ...(module !== undefined ? { module } : {}), ...(effective.mode ? { mode: modeOf(effective.mode)! } : {}) },

        add: actionId => actionId === designModeActions.addItem ? add() : { rejected: actionId },

        act: (actionId, item) => {
            switch (actionId) {
                case designModeActions.addSubItem: return item.parentId !== undefined ? { rejected: 'subItemOfSubItem' } : add(item.id);
                case designModeActions.moveEarlier:
                case designModeActions.moveLater: {
                    const to = item.index + (actionId === designModeActions.moveEarlier ? -1 : 1);
                    const siblings = siblingsOf(own, item.id);
                    if (!siblings || to < 0 || to >= siblings.length) return { rejected: 'noWhere' };
                    return plan('Move', replace(moveItem(own, item.id, to)), { itemId: item.id });
                }
                case designModeActions.duplicate: {
                    const duplicated = duplicateItem(own, item.id, newId);
                    return duplicated.copy ? plan('Duplicate', replace(duplicated.items), { itemId: duplicated.copy.id }) : { rejected: actionId };
                }
                case designModeActions.delete: {
                    const siblings = siblingsOf(own, item.id) ?? [];
                    const at = siblings.findIndex(candidate => candidate.id === item.id);
                    const next = siblings[at + 1] ?? siblings[at - 1];
                    return plan('Remove', replace(removeItem(own, item.id)), { itemId: next?.id ?? null });
                }
                default: return { rejected: actionId };
            }
        },

        rename: (item, title) => plan('Rename', replace(changeItem(own, item.id, { title })), { itemId: item.id }),

        // The target and the slot are chosen with the editors the registry has for them (DM5); the choice is one list edit like the others.
        choice: (actionId, item): DesignModeChoice | undefined => {
            const authored = findItem(own, item.id);
            if (!authored) return undefined;
            if (actionId === designModeActions.target) {
                const property = choiceProperty('target', 'Navigate to', 'navigationItemTarget', authored.target);
                return { property, plan: value => plan('Link', replace(changeItem(own, item.id, { target: isTarget(value) ? value : undefined })), { itemId: item.id }) };
            }
            if (actionId === designModeActions.slot) {
                const property = choiceProperty('slot', 'Render into slot', 'renderingSlot', authored.slot ?? 'content');
                return { property, plan: value => plan('Change', replace(changeItem(own, item.id, { slot: typeof value === 'string' && value !== 'content' ? value : undefined })), { itemId: item.id }) };
            }
            if (actionId === 'icon') {
                const property = choiceProperty('icon', 'Icon', 'icon', authored.icon);
                return { property, plan: value => plan('Change', replace(changeItem(own, item.id, { icon: typeof value === 'string' && value !== '' ? value : undefined })), { itemId: item.id }) };
            }
            return undefined;
        },

        // An item the application defines cannot be changed here. It can be overridden - the region switches to override and copies the items (NAV5) - or
        // edited where it is defined (NAV7).
        readOnlyActions: () => module === undefined ? [] : [
            { id: 'overrideHere', label: strings.overrideHere, plan: () => plan('Override', switchOutletMode(navigation, module, region, OutletMode.Overrides, { copy: true })) },
            { id: 'editAtApplication', label: strings.editAtApplication, plan: () => ({ label: 'Edit at application level', edits: [], editAtApplication: true }) },
        ],
    };
}

const isTarget = (value: unknown): value is { module: string; feature?: string } => typeof value === 'object' && value !== null && typeof (value as { module?: unknown }).module === 'string';

function choiceProperty(path: string, label: string, editorKind: string, value: unknown): InspectedProperty {
    return {
        descriptor: { path, label, group: 'Content', valueType: PropertyValueType.String, editorKind },
        currentValue: value, effectiveValue: value, source: ValueSource.Local, editable: true,
    };
}


