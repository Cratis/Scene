// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletKind, OutletMode, type ComponentDesignModeDescriptor, type OutletItem, type OutletRefinement, type OutletSubject, type SceneDocument } from '@cratis/scene.model';
import { OutletDiagnosticCode, OutletItemSource, OutletRemoval, effectiveOutlet, type EffectiveOutlet, type OutletChain } from '@cratis/scene.engine';
import { inheritedReasonRule } from '../designModeRules';
import { DesignModeItemSourceKind, designModeActions, type DesignModeChoice, type DesignModeItem, type DesignModeItemSource, type DesignModePlan, type DesignModeReadOnlyAction, type DesignModeRejection } from '../designModeTypes';
import { bindingActionsOf, bindingChange, bindingChips, bindingProperty, isUnbound, type OutletBindingContext } from './outletBindings';
import { addActionOf, outletDesignModeOf } from './outletDesignModes';
import { refinementAt, withRefinement, type OutletEditingLevel } from '../../Outlets/outletDocument';
import { addOutletSubItem, changeOutletItem, duplicateOutletItem, findOutletItem, moveOutletItem, removeOutletItem, siblingsOfOutletItem } from './outletItemOps';
import { chainAt } from '../../Outlets/screenOutletChain';
import type { OutletStrings } from './OutletStrings';

export type OutletLevelMode = 'inherit' | 'extend' | 'override';

export interface OutletDesignInputs {
    document: SceneDocument;

    // The levels the screen's outlets resolve through, as `screenOutletChain` builds them.
    outlets: OutletChain;
    outlet: string;

    // The level being edited: the screen, or a module or feature above it - what it changes, every screen below it gets.
    level: OutletEditingLevel;
    newId: () => string;
    binding: OutletBindingContext;
    strings: OutletStrings;
}

// An outlet as the level being edited sees it, and what the outlet design mode does to it (StudioIssues#1330). What it shows, in what order, where each
// item comes from, which are hidden or overridden, and the mode - all of it is Scene's `effectiveOutlet`. What this adds are the edits of the level's own
// refinement: its items, what it hides, and its mode.
export interface OutletDesign extends DesignModeItemSource {
    name: string;
    outletKind: OutletKind;
    subject?: OutletSubject;
    slot?: string;
    declaredBy?: string;
    level: OutletEditingLevel;
    mode: OutletLevelMode;
    effective: EffectiveOutlet;

    // The inherited or contributed items the level hides, and the inherited items its override leaves out: struck through, with Bring back.
    removed: readonly DesignModeItem[];

    // The design mode of the outlet's kind: its "+" and the chips of its floating item toolbar.
    designMode: ComponentDesignModeDescriptor;
    setMode: (mode: OutletLevelMode, copy?: boolean) => DesignModePlan | DesignModeRejection;

    // Adds an item the caller made - a filter that already sets the parameter it is for - after the level's own items.
    addItem: (item: OutletItem) => DesignModePlan;
    hide: (item: DesignModeItem) => DesignModePlan | DesignModeRejection;
    bringBack: (item: DesignModeItem) => DesignModePlan | DesignModeRejection;
}

const levelModeOf = (mode: OutletMode | undefined): OutletLevelMode =>
    mode === OutletMode.Overrides ? 'override' : mode === OutletMode.Extends ? 'extend' : 'inherit';

const outletModes: Record<OutletLevelMode, OutletMode> = { inherit: OutletMode.Inherits, extend: OutletMode.Extends, override: OutletMode.Overrides };

const titleOf = (item: OutletItem): string => {
    const title = (item as { title?: unknown }).title;
    return typeof title === 'string' ? title : '';
};

const childrenOf = (item: OutletItem): readonly OutletItem[] => {
    const children = (item as { children?: unknown }).children;
    return Array.isArray(children) ? children as OutletItem[] : [];
};

// Whether Scene can resolve the outlet for the screen: a level of the chain declares it.
export function declaresOutlet(outlets: OutletChain, outlet: string): boolean {
    return outlets.chain.some(level => (level.outlets ?? []).some(candidate => candidate.name === outlet));
}

export function createOutletDesign(inputs: OutletDesignInputs): OutletDesign | undefined {
    const { document, outlet, level, newId, binding, strings } = inputs;
    const scoped = chainAt(inputs.outlets, level);
    if (!declaresOutlet(scoped, outlet)) return undefined;
    const effective = effectiveOutlet(scoped.chain, outlet, scoped.contributors);
    // What the outlet acts on is what a hook of it acts on unless it says otherwise (StudioIssues#1331).
    const hooks: OutletBindingContext = effective.subject ? { ...binding, outletSubject: effective.subject } : binding;
    if (effective.diagnostics.some(diagnostic => diagnostic.code === OutletDiagnosticCode.UnknownOutlet) || !effective.kind) return undefined;
    const kind = effective.kind;

    const current = refinementAt(document, level, outlet);
    const own = current?.items ?? [];
    const hidden = current?.hide ?? [];
    const mode = levelModeOf(effective.mode);
    const problemsOf = (id: string) => effective.diagnostics.filter(diagnostic => diagnostic.item === id).map(diagnostic => ({ code: diagnostic.code, message: diagnostic.message }));

    const items: DesignModeItem[] = [];
    const ownTop = own.map(item => item.id);
    const describe = (item: OutletItem, provenance: { owner: string; level: string; source: string }, editable: boolean, parentId?: string): void => {
        const siblings = editable ? siblingsOfOutletItem(own, item.id) ?? [] : [];
        const problems = problemsOf(item.id);
        items.push({
            id: item.id,
            label: titleOf(item),
            index: editable ? siblings.findIndex(candidate => candidate.id === item.id) : -1,
            count: editable ? siblings.length : 0,
            ...(parentId ? { parentId } : {}),
            readOnly: !editable,
            ...(!editable ? { readOnlyReason: inheritedReasonRule, origin: provenance.owner } : {}),
            values: { ...item, provenance },
            chips: bindingChips(item, hooks),
            ...(problems.length > 0 ? { problems } : {}),
            unlinked: isUnbound(item),
            provenance,
        });
        childrenOf(item).forEach(child => describe(child, provenance, editable, item.id));
    };
    effective.items.forEach(entry => {
        const editable = entry.provenance.source === OutletItemSource.Own && entry.editable && ownTop.includes(entry.item.id);
        describe(entry.item, { owner: entry.provenance.owner, level: entry.provenance.level, source: entry.provenance.source }, editable);
    });
    const removed: DesignModeItem[] = effective.removed.map(entry => ({
        id: entry.item.id,
        label: titleOf(entry.item),
        index: -1,
        count: 0,
        readOnly: true,
        readOnlyReason: inheritedReasonRule,
        origin: entry.provenance.owner,
        values: { ...entry.item },
        unlinked: false,
        provenance: { owner: entry.provenance.owner, level: entry.provenance.level, source: entry.provenance.source },
        removal: entry.removal === OutletRemoval.Hidden ? 'hidden' : 'overridden',
    }));

    // The level's refinement with a change, without what is empty; nothing at all - inheriting - when nothing is left.
    const refined = (patch: Partial<OutletRefinement>): OutletRefinement | undefined => {
        const next: OutletRefinement = { ...(current ?? { outlet }), ...patch, outlet };
        if (!next.items || next.items.length === 0) delete next.items;
        if (!next.hide || next.hide.length === 0) delete next.hide;
        if (next.mode === undefined) delete next.mode;
        return next.items || next.hide || next.mode !== undefined ? next : undefined;
    };
    const plan = (label: string, refinement: OutletRefinement | undefined, select?: DesignModePlan['select'], more: Partial<DesignModePlan> = {}): DesignModePlan => ({
        label, edits: [], documentChange: changed => withRefinement(changed, level, outlet, refinement), ...(select ? { select } : {}), ...more,
    });

    // Adding to an outlet the level inherits untouched makes it extend: inheriting keeps the items above unchanged and ignores a level's own.
    const extendingIfInherited = (): Partial<OutletRefinement> => mode === 'inherit' ? { mode: OutletMode.Extends } : {};
    const withItems = (label: string, next: OutletItem[], select: string | null, more: Partial<DesignModePlan> = {}) => {
        const switching = mode === 'inherit' && next.length > own.length;
        return plan(label, refined({ items: next, ...extendingIfInherited() }), { itemId: select }, { ...more, ...(switching ? { notice: strings.extendsNotice } : {}) });
    };

    const newItem = (): OutletItem | DesignModeRejection => {
        const id = newId();
        const item = addActionOf[kind].item;
        const title = strings.newItem[item] ?? strings.newItem.button;
        switch (item) {
            case OutletItemKind.Tab: {
                const screen = binding.screens[0];
                return screen ? { kind: OutletItemKind.Tab, id, title, shows: screen.id } : { rejected: 'noScreenForTab' };
            }
            case OutletItemKind.Filter: return { kind: OutletItemKind.Filter, id, title };
            case OutletItemKind.Stat: return { kind: OutletItemKind.Stat, id, title };
            case OutletItemKind.Navigation: return { kind: OutletItemKind.Navigation, id, title };
            default: return { kind: OutletItemKind.Button, id, title };
        }
    };
    const isRejected = (outcome: OutletItem | DesignModeRejection): outcome is DesignModeRejection => 'rejected' in outcome;

    const ownOf = (item: DesignModeItem) => (item.readOnly ? undefined : findOutletItem(own, item.id));
    const designMode = outletDesignModeOf(kind);

    const hide = (item: DesignModeItem): DesignModePlan | DesignModeRejection => {
        if (!item.readOnly) return { rejected: 'ownItem' };
        if (hidden.includes(item.id)) return { rejected: 'alreadyHidden' };
        return plan('Hide', refined({ hide: [...hidden, item.id], ...extendingIfInherited() }), { itemId: null });
    };

    const bringBack = (item: DesignModeItem): DesignModePlan | DesignModeRejection => {
        if (hidden.includes(item.id)) return plan('Bring back', refined({ hide: hidden.filter(id => id !== item.id) }), { itemId: item.id });
        if (item.removal === 'overridden') {
            const original = effective.removed.find(entry => entry.item.id === item.id)?.item;
            if (!original) return { rejected: 'notRemoved' };
            return plan('Bring back', refined({ items: [...own, structuredClone(original)] }), { itemId: item.id });
        }
        return { rejected: 'notRemoved' };
    };

    const setMode = (next: OutletLevelMode, copy = false): DesignModePlan | DesignModeRejection => {
        if (next === mode) return { rejected: 'sameMode' };
        if (next === 'inherit') return plan('Inherit', undefined, { itemId: null });
        if (next === 'extend') return plan('Extend', refined({ mode: OutletMode.Extends }));
        const inherited = copy ? effective.items.filter(entry => entry.provenance.source !== OutletItemSource.Contribution && !ownTop.includes(entry.item.id)).map(entry => structuredClone(entry.item)) : [];
        return plan('Override', refined({ mode: outletModes.override, items: [...inherited, ...own], hide: [] }));
    };

    const readOnlyActions = (item: DesignModeItem): readonly DesignModeReadOnlyAction[] => {
        if (item.removal) return [{ id: 'bringBack', label: strings.bringBack, plan: () => bringBack(item) }];
        if (item.parentId !== undefined) return [];
        return [{ id: 'hide', label: strings.hide, plan: () => hide(item) }];
    };

    return {
        kind: DesignModeItemSourceKind.Outlet,
        items,
        removed,
        name: outlet,
        ...(effective.subject ? { subject: effective.subject } : {}),
        ...(effective.slot ? { slot: effective.slot } : {}),
        ...(effective.declaredBy ? { declaredBy: effective.declaredBy } : {}),
        outletKind: kind,
        level,
        mode,
        effective,
        designMode,
        regionTag: { text: effective.summary, long: strings.tagLong(outlet, effective.summary), kind: mode },

        addItem: item => withItems('Add', [...own, item], item.id),

        add: actionId => {
            if (actionId !== addActionOf[kind].id) return { rejected: actionId };
            const item = newItem();
            if (isRejected(item)) return item;
            return withItems('Add', [...own, item], item.id, { renameNext: true });
        },

        act: (actionId, item) => {
            const authored = ownOf(item);
            if (!authored) return { rejected: item.readOnlyReason ?? inheritedReasonRule };
            switch (actionId) {
                case designModeActions.moveEarlier:
                case designModeActions.moveLater: {
                    const to = item.index + (actionId === designModeActions.moveEarlier ? -1 : 1);
                    if (to < 0 || to >= item.count) return { rejected: 'noWhere' };
                    return withItems('Move', moveOutletItem(own, item.id, to), item.id);
                }
                case designModeActions.duplicate: {
                    const duplicated = duplicateOutletItem(own, item.id, newId);
                    return duplicated.copy ? withItems('Duplicate', duplicated.items, duplicated.copy.id) : { rejected: actionId };
                }
                case designModeActions.delete: {
                    const siblings = siblingsOfOutletItem(own, item.id) ?? [];
                    const at = siblings.findIndex(candidate => candidate.id === item.id);
                    const next = siblings[at + 1] ?? siblings[at - 1];
                    return withItems('Remove', removeOutletItem(own, item.id), next?.id ?? null);
                }
                case designModeActions.addSubItem: {
                    if (kind !== OutletKind.Navigation || item.parentId !== undefined) return { rejected: 'subItemOfSubItem' };
                    const child = { kind: OutletItemKind.Navigation, id: newId(), title: strings.newItem.navigation } as OutletItem;
                    return withItems('Add', addOutletSubItem(own, item.id, child), child.id, { renameNext: true });
                }
                default: return { rejected: actionId };
            }
        },

        rename: (item, title) => ownOf(item) ? withItems('Rename', changeOutletItem(own, item.id, { title }), item.id) : { rejected: item.readOnlyReason ?? inheritedReasonRule },

        // A binding is chosen with the editor the registry has for it (DM5); the choice is one edit of the level's own items, like the others.
        choice: (actionId, item): DesignModeChoice | undefined => {
            const authored = ownOf(item);
            if (!authored || !bindingActionsOf(authored.kind).includes(actionId)) return undefined;
            const property = bindingProperty(actionId, authored, hooks);
            if (!property) return undefined;
            return {
                property,
                plan: value => {
                    const change = bindingChange(actionId, value);
                    return change ? withItems('Bind', changeOutletItem(own, item.id, change), item.id) : { rejected: actionId };
                },
            };
        },

        readOnlyActions,
        setMode,
        hide,
        bringBack,
    };
}
