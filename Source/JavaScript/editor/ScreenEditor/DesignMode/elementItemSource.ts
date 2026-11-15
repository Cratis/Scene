// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind, type ApplicationStructure, type ExternalComponent, type NodeInspection, type SceneElement } from '@cratis/scene.model';
import { elementNodeId } from '@cratis/scene.engine';
import { createExternalComponent } from '../Document/createExternalComponent';
import { Ownership } from '../Structure/Ownership';
import { editForValue } from '../Properties/propertyEdits';
import { upgradeOf } from '../Toolbar/upgradeToolbarButton';
import { cloneWithNewIds } from './cloneWithNewIds';
import { inheritedReasonRule } from './designModeRules';
import { DesignModeItemSourceKind, designModeActions, type DesignModeChoice, type DesignModeItem, type DesignModeItemSource } from './designModeTypes';

// What an add action of a component whose items are elements puts in the component: which slot, which component, and what it starts as. The
// action ids are Scene's (`toolbarDesignMode` declares `addButton`); the rest is the editor knowing what that component's items are.
export interface ElementItemKind {
    slot: string;
    componentName: string;
    labelProperty: string;
    startingLabel: string;

    // Whether the item stands for something the author has not yet linked to anything (a button without a slice).
    isUnlinked: (id: string, properties: Record<string, unknown>) => boolean;

    // What a new item holds besides its title.
    startingProperties: Record<string, unknown>;
}

const textOf = (value: unknown): string => (typeof value === 'string' ? value : '');

export const elementItemKinds: Readonly<Record<string, Omit<ElementItemKind, 'startingLabel'>>> = {
    [designModeActions.addButton]: {
        slot: 'items',
        componentName: 'core:toolbarItem',
        labelProperty: 'label',
        // A button that names neither a slice nor a legacy target (and has no destination of its own) does nothing yet - Scene's `toolbarButtonSliceEmpty`.
        isUnlinked: (_id, properties) => textOf(properties.slice) === '' && textOf(properties.target) === '' && properties.destination === undefined,
        // A button is a slice button when it says so (`kind: Action`) or names a slice; a new one says so, so it is a button before it has a slice.
        startingProperties: { kind: 'Action' },
    },
};

export interface ElementItemSourceInputs {
    component: ExternalComponent;
    addActionId: string;
    ownershipOf: (elementId: string) => Ownership;
    inspect: (elementId: string) => NodeInspection | undefined;
    newId: () => string;

    // The title a new item starts with.
    startingLabel: string;

    // The application, to read what a button that still names a command already runs.
    structure?: ApplicationStructure;
}

// The items of a component that holds them as elements in a slot - a toolbar's buttons - and what the design mode does to them. Every action is
// a Scene edit on the elements themselves (DM8), so undo, redo and the dirty state know nothing special about them.
export function createElementItemSource({ component, addActionId, ownershipOf, inspect, newId, startingLabel, structure }: ElementItemSourceInputs): DesignModeItemSource | undefined {
    const kind = elementItemKinds[addActionId];
    if (!kind) return undefined;

    const held = (component.slots?.[kind.slot] ?? []) as SceneElement[];
    const items: DesignModeItem[] = held.map((element, index) => {
        const id = (element as { id: string }).id;
        const properties = ((element as { properties?: Record<string, unknown> }).properties ?? {});
        const readOnly = ownershipOf(id) !== Ownership.Local;
        // A button that names a command the application has exactly one slice for already runs that slice: it shows it and is not flagged.
        const upgrade = structure ? upgradeOf(structure, id, properties) : undefined;
        return {
            id,
            label: textOf(properties[kind.labelProperty]),
            index,
            count: held.length,
            readOnly,
            ...(readOnly ? { readOnlyReason: inheritedReasonRule } : {}),
            values: upgrade ? { ...properties, slice: upgrade.slice } : properties,
            unlinked: upgrade ? false : kind.isUnlinked(id, properties),
        };
    });

    const holder = elementNodeId(component.id);
    const insertAt = (element: SceneElement, index: number, label: string) => ({
        label,
        edits: [{ kind: SceneEditKind.InsertNode as const, target: holder, slot: kind.slot, index, element }],
        select: { elementId: (element as { id: string }).id },
    });

    return {
        kind: DesignModeItemSourceKind.Elements,
        items,

        add: actionId => {
            if (actionId !== addActionId) return { rejected: actionId };
            if (ownershipOf(component.id) !== Ownership.Local) return { rejected: 'inherited' };
            const created = createExternalComponent(newId(), kind.componentName, kind.componentName, { ...kind.startingProperties, [kind.labelProperty]: startingLabel });
            return { ...insertAt(created, held.length, 'Add'), renameNext: true };
        },

        act: (actionId, item) => {
            const element = held[item.index];
            switch (actionId) {
                case designModeActions.moveEarlier:
                case designModeActions.moveLater: {
                    const index = item.index + (actionId === designModeActions.moveEarlier ? -1 : 1);
                    if (index < 0 || index >= held.length) return { rejected: 'noWhere' };
                    return { label: 'Move', edits: [{ kind: SceneEditKind.MoveNode, nodeId: elementNodeId(item.id), target: holder, slot: kind.slot, index }], select: { elementId: item.id } };
                }
                case designModeActions.duplicate:
                    return insertAt(cloneWithNewIds(element, newId), item.index + 1, 'Duplicate');
                case designModeActions.delete: {
                    const next = held[item.index + 1] ?? held[item.index - 1];
                    return {
                        label: 'Remove',
                        edits: [{ kind: SceneEditKind.RemoveNode, nodeId: elementNodeId(item.id) }],
                        select: { elementId: next ? (next as { id: string }).id : component.id },
                    };
                }
                default: return { rejected: actionId };
            }
        },

        rename: (item, label) => {
            const property = inspect(item.id)?.properties.find(candidate => candidate.descriptor.path === kind.labelProperty);
            return property ? { label: 'Rename', edits: [editForValue(item.id, property, label)], select: { elementId: item.id } } : { rejected: 'rename' };
        },

        // The same property, drawn by the same editor the Properties tab draws it with (DM5, PE3); the choice made there is the same edit.
        choice: (actionId, item): DesignModeChoice | undefined => {
            const path = actionId === designModeActions.slice ? 'slice' : actionId === designModeActions.emphasis ? 'emphasis' : undefined;
            const property = path ? inspect(item.id)?.properties.find(candidate => candidate.descriptor.path === path) : undefined;
            if (!property) return undefined;
            return { property, plan: value => ({ label: 'Change', edits: [editForValue(item.id, property, value)], select: { elementId: item.id } }) };
        },

        readOnlyActions: () => [],
    };
}
