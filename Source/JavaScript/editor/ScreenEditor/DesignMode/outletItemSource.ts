// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, PropertyValueType, ValueSource, type ApplicationStructure, type InspectedProperty, type OutletItem, type PropertyDescriptor } from '@cratis/scene.model';
import { ApplicationStructureIndex, normalizeToolbarButton, outletActionAsToolbarButton } from '@cratis/scene.engine';
import { editForValue } from '../Properties/propertyEdits';
import { inheritedReasonRule } from './designModeRules';
import { DesignModeItemSourceKind, designModeActions, type DesignModeChoice, type DesignModeItem, type DesignModeItemSource, type DesignModePlan } from './designModeTypes';

export interface OutletItemSourceInputs {
    componentId: string;

    // The outlet element's `items` property: the buttons it carries (Scene 5's `core:outletItems`, the toolbar since Scene 5).
    property: InspectedProperty;
    newId: () => string;
    startingLabel: string;

    // The application, for what a button that names a command already runs.
    structure?: ApplicationStructure;
}

type Button = OutletItem & { id: string; title?: string; slice?: string; command?: string };

const choiceFields = new Map<string, string>([
    [designModeActions.slice, 'slice'],
    [designModeActions.emphasis, 'emphasis'],
    [designModeActions.display, 'display'],
]);

const asButtons = (value: unknown): Button[] => (Array.isArray(value) ? value : []).filter((item): item is Button => typeof item === 'object' && item !== null && typeof (item as Button).id === 'string');

// The buttons of an outlet of actions drawn where the screen places it - the toolbar since Scene 5 (StudioIssues#1328) - and what the toolbar's design mode
// does to them. The buttons are the element's `items` property, so every change is one edit of that property: one undo step, whichever it was (DM8).
export function createOutletItemSource({ componentId, property, newId, startingLabel, structure }: OutletItemSourceInputs): DesignModeItemSource {
    const buttons = asButtons(property.effectiveValue);
    const readOnly = !property.editable;
    const index = structure && structure.modules.length > 0 ? new ApplicationStructureIndex(structure) : undefined;
    const sliceOfCommand = (button: Button): string | undefined => {
        if (!index || button.slice || !button.command) return undefined;
        const toolbarButton = outletActionAsToolbarButton({ ...button, kind: OutletItemKind.Button, title: button.title ?? '' });
        if (!toolbarButton) return undefined;
        const { button: normalized, converted } = normalizeToolbarButton(index, toolbarButton);
        return converted ? normalized.slice : undefined;
    };

    const items: DesignModeItem[] = buttons.map((button, position) => {
        const upgraded = sliceOfCommand(button);
        return {
            id: button.id,
            label: button.title ?? '',
            index: position,
            count: buttons.length,
            readOnly,
            ...(readOnly ? { readOnlyReason: inheritedReasonRule } : {}),
            values: upgraded ? { ...button, slice: upgraded } : { ...button },
            // A button that names a command runs something even when the application cannot say which slice; only one with neither is flagged (TB5).
            unlinked: !upgraded && !button.slice && !button.command,
        };
    });

    const change = (label: string, next: Button[], selected: string | null): DesignModePlan => ({
        label,
        edits: [editForValue(componentId, property, next)],
        select: { itemId: selected },
    });
    const refuseReadOnly = () => (readOnly ? { rejected: property.reason ?? 'inherited' } : undefined);

    return {
        kind: DesignModeItemSourceKind.Collection,
        items,

        add: actionId => {
            if (actionId !== designModeActions.addButton) return { rejected: actionId };
            const refusal = refuseReadOnly();
            if (refusal) return refusal;
            const id = newId();
            return { ...change('Add', [...buttons, { kind: OutletItemKind.Button, id, title: startingLabel } as Button], id), renameNext: true };
        },

        act: (actionId, item) => {
            const refusal = refuseReadOnly();
            if (refusal) return refusal;
            switch (actionId) {
                case designModeActions.moveEarlier:
                case designModeActions.moveLater: {
                    const to = item.index + (actionId === designModeActions.moveEarlier ? -1 : 1);
                    if (to < 0 || to >= buttons.length) return { rejected: 'noWhere' };
                    const next = [...buttons];
                    const [moved] = next.splice(item.index, 1);
                    next.splice(to, 0, moved);
                    return change('Move', next, item.id);
                }
                case designModeActions.duplicate: {
                    const id = newId();
                    const next = [...buttons];
                    next.splice(item.index + 1, 0, { ...structuredClone(buttons[item.index]), id });
                    return change('Duplicate', next, id);
                }
                case designModeActions.delete: {
                    const following = buttons[item.index + 1] ?? buttons[item.index - 1];
                    return change('Remove', buttons.filter(button => button.id !== item.id), following?.id ?? null);
                }
                default: return { rejected: actionId };
            }
        },

        rename: (item, label) => refuseReadOnly() ?? change('Rename', withField(buttons, item.id, 'title', label), item.id),

        // The slice a button starts, its emphasis and what it shows, drawn by the same editor the Properties tab draws the button's field with (DM5, PE3).
        choice: (actionId, item): DesignModeChoice | undefined => {
            const field = choiceFields.get(actionId);
            const descriptor = field ? property.descriptor.item?.properties.find(candidate => candidate.path === field) : undefined;
            const button = buttons.find(candidate => candidate.id === item.id) as Record<string, unknown> | undefined;
            if (!field || !descriptor || !button) return undefined;

            // Only a button shows an icon, a title or both (Scene 5.1); a group or a menu has no `display`.
            if (field === 'display' && typeof button.kind === 'string' && button.kind.toLowerCase() !== OutletItemKind.Button) return undefined;
            return {
                property: fieldProperty(descriptor, button[field], !readOnly),

                // The default is what a button without the field shows, so choosing it leaves the field out rather than writing it (absent = default).
                plan: value => refuseReadOnly() ?? change('Change', withField(buttons, item.id, field, field === 'display' && value === descriptor.default ? undefined : value), item.id),
            };
        },

        readOnlyActions: () => [],
    };
}

function withField(buttons: readonly Button[], id: string, field: string, value: unknown): Button[] {
    return buttons.map(button => {
        if (button.id !== id) return button;
        const next = { ...button } as Record<string, unknown>;
        if (value === undefined || value === null || value === '') delete next[field];
        else next[field] = value;
        return next as unknown as Button;
    });
}

function fieldProperty(descriptor: PropertyDescriptor, current: unknown, editable: boolean): InspectedProperty {
    return {
        descriptor: descriptor.valueType === undefined ? { ...descriptor, valueType: PropertyValueType.String } : descriptor,
        currentValue: current,
        effectiveValue: current ?? descriptor.default,
        source: current === undefined ? ValueSource.Default : ValueSource.Local,
        editable,
    };
}
