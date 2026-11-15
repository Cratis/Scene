// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterControl, OutletItemKind, OutletSubject, Opens, PropertyEditorKind, PropertyValueType, QueryResultShape, ValueSource, type ApplicationStructure, type InspectedProperty, type OutletItem, type PropertyChoice, type PropertyDescriptor, type QueryCandidate } from '@cratis/scene.model';
import { targetLabel } from '../Navigation/regionItemSource';
import { designModeActions } from '../designModeTypes';
import type { OutletStrings } from './OutletStrings';
import { enabledChangeOf, enabledChipText, opensChangeOf, opensChipText, opensValueOf } from '../../Placement/hookBinding';
import type { HookPlacementInput, PlacementEnvironment } from '../../Placement/hookPlacement';
import type { PlacementStrings } from '../../Placement/PlacementStrings';

// What the items of an outlet can be bound to, as Studio offers it (6c): an action to a State Change slice and where it opens, a filter to a parameter of the
// query the screen shows, a tab to a screen, a stat to a field of a single-result query, a navigation item to a module, feature or screen.
export interface OutletBindingContext {

    // The queries the screen shows: their parameters are what filters set, the fields of the single-result ones what stats show.
    queries: readonly QueryCandidate[];

    // The screens a tab can show.
    screens: readonly { id: string; label: string }[];

    // Scene's descriptors of an action's properties - the slice, the emphasis, what it shows, where it opens - so a choice is drawn by the editor the
    // registry has for it, as it is today.
    actionProperties: readonly PropertyDescriptor[];
    structure?: ApplicationStructure;
    strings: OutletStrings['bindings'];

    // What a hook's Opens and Enabled are worked out against (StudioIssues#1331): the slices, the page's slots and what supplies a slice's inputs. Without it a chip
    // says only what the hook stores.
    placement?: PlacementEnvironment;
    placementStrings?: PlacementStrings;

    // What the outlet acts on when the hook does not say.
    outletSubject?: OutletSubject;
}

// What a hook of an outlet - a button or a menu entry - says of where its slice opens and when it is enabled.
export function hookOf(item: OutletItem, context: Pick<OutletBindingContext, 'outletSubject'>): HookPlacementInput {
    const bound = item as Bound;
    return {
        ...(typeof bound.slice === 'string' && bound.slice !== '' ? { slice: bound.slice } : typeof bound.command === 'string' && bound.command !== '' ? { slice: bound.command } : {}),
        ...(bound.opens ? { opens: bound.opens as Opens } : {}),
        ...(typeof bound.opensIn === 'string' && bound.opensIn !== '' ? { opensIn: bound.opensIn } : {}),
        subject: (bound.subject as OutletSubject | undefined) ?? context.outletSubject ?? OutletSubject.Screen,
        ...(typeof bound.enabledWhen === 'string' && bound.enabledWhen !== '' ? { enabledWhen: bound.enabledWhen } : {}),
    };
}

// The chips each kind of item has, in the order they are drawn.
export const bindingActionsOf = (kind: OutletItemKind | string): readonly string[] => {
    switch (kind) {
        case OutletItemKind.Button:
        case OutletItemKind.MenuEntry: return [designModeActions.slice, designModeActions.opens, designModeActions.enabled, designModeActions.emphasis, designModeActions.display];
        case OutletItemKind.Filter: return [designModeActions.sets, designModeActions.control];
        case OutletItemKind.Tab: return [designModeActions.shows];
        case OutletItemKind.Stat: return [designModeActions.valueFrom];
        case OutletItemKind.Navigation: return [designModeActions.target, designModeActions.slot, 'icon'];
        default: return [];
    }
};

const reference = (first: string, second: string) => `${first}.${second}`;
const split = (value: unknown): { first: string; second: string } | undefined => {
    if (typeof value !== 'string') return undefined;
    const at = value.lastIndexOf('.');
    return at > 0 && at < value.length - 1 ? { first: value.slice(0, at), second: value.slice(at + 1) } : undefined;
};

const property = (path: string, label: string, valueType: PropertyValueType, editorKind: string, value: unknown, choices?: readonly PropertyChoice[], editorOptions?: Record<string, unknown>): InspectedProperty => ({
    descriptor: { path, label, group: 'Behavior', valueType, editorKind, ...(choices ? { choices: [...choices] } : {}), ...(editorOptions ? { editorOptions } : {}) },
    currentValue: value, effectiveValue: value, source: ValueSource.Local, editable: true,
});

const parameterChoices = (queries: readonly QueryCandidate[]): PropertyChoice[] =>
    queries.flatMap(query => query.parameters.map(parameter => ({ value: reference(query.name, parameter.name), label: `${query.name} › ${parameter.name}` })));

const singleResultFieldChoices = (queries: readonly QueryCandidate[]): PropertyChoice[] =>
    queries.filter(query => query.resultShape !== QueryResultShape.Collection)
        .flatMap(query => query.resultFields.map(field => ({ value: reference(query.name, field.name), label: `${query.name} › ${field.name}` })));

type Bound = OutletItem & Record<string, unknown>;

// The property a chip's popover - or the inspector - draws for the item's binding, with what it holds now; nothing for a binding the item does not have.
export function bindingProperty(actionId: string, item: OutletItem, context: OutletBindingContext): InspectedProperty | undefined {
    const bound = item as Bound;
    const text = context.strings;
    const ref = (value: unknown) => {
        const given = value as { query?: string; parameter?: string; field?: string } | undefined;
        return given?.query ? reference(given.query, given.parameter ?? given.field ?? '') : undefined;
    };
    switch (actionId) {
        case designModeActions.sets: return property('sets', text.sets, PropertyValueType.Enum, PropertyEditorKind.Enum, ref(bound.sets), parameterChoices(context.queries));
        case designModeActions.control: return property('control', text.control, PropertyValueType.Enum, PropertyEditorKind.Enum, bound.control ?? FilterControl.Search,
            Object.values(FilterControl).map(control => ({ value: control, label: text.controls[control] ?? control })));
        case designModeActions.shows: return property('shows', text.shows, PropertyValueType.Enum, PropertyEditorKind.Enum, bound.shows, context.screens.map(screen => ({ value: screen.id, label: screen.label })));
        case designModeActions.valueFrom: return property('valueFrom', text.valueFrom, PropertyValueType.Enum, PropertyEditorKind.Enum, ref(bound.valueFrom), singleResultFieldChoices(context.queries));
        case designModeActions.target: return property('target', text.target, PropertyValueType.String, 'navigationItemTarget', bound.target);
        case designModeActions.slot: return property('slot', text.slot, PropertyValueType.String, 'renderingSlot', bound.slot ?? 'content');
        case 'icon': return property('icon', text.icon, PropertyValueType.String, 'icon', bound.icon);
        // Where the slice opens and when the button is enabled are worked out by Scene's resolver against the page, so they have editors of their own that say why.
        case designModeActions.opens: return property('opens', context.placementStrings?.opens ?? text.opens, PropertyValueType.String, 'hookOpens', { value: opensValueOf(bound.opens as Opens | undefined, bound.opensIn as string | undefined), hook: hookOf(item, context) });
        case designModeActions.enabled: return property('enabled', context.placementStrings?.enabled ?? 'Enabled', PropertyValueType.String, 'hookEnabled', { subject: bound.subject, enabledWhen: bound.enabledWhen, hook: hookOf(item, context), ...(context.outletSubject ? { outletSubject: context.outletSubject } : {}) });
        case designModeActions.slice:
        case designModeActions.emphasis:
        case designModeActions.display: {
            const descriptor = context.actionProperties.find(candidate => candidate.path === actionId);
            if (descriptor) return { descriptor, currentValue: bound[actionId], effectiveValue: bound[actionId] ?? descriptor.default, source: ValueSource.Local, editable: true };
            if (actionId === designModeActions.slice) return property('slice', 'Slice', PropertyValueType.String, PropertyEditorKind.Slice, bound.slice);
            return undefined;
        }
        default: return undefined;
    }
}

// What the item becomes when the binding is chosen: the properties to set, with nothing for the ones cleared. Nothing at all for a value that is no binding.
export function bindingChange(actionId: string, value: unknown): Record<string, unknown> | undefined {
    const empty = value === undefined || value === null || value === '';
    switch (actionId) {
        case designModeActions.sets: {
            const parts = split(value);
            return empty ? { sets: undefined } : parts ? { sets: { query: parts.first, parameter: parts.second } } : undefined;
        }
        case designModeActions.valueFrom: {
            const parts = split(value);
            return empty ? { valueFrom: undefined } : parts ? { valueFrom: { query: parts.first, field: parts.second } } : undefined;
        }
        case designModeActions.control: return { control: empty ? undefined : value };
        case designModeActions.shows: return typeof value === 'string' && value !== '' ? { shows: value } : undefined;
        case designModeActions.target: return { target: typeof value === 'object' && value !== null && typeof (value as { module?: unknown }).module === 'string' ? value : undefined };
        case designModeActions.slot: return { slot: typeof value === 'string' && value !== 'content' && value !== '' ? value : undefined };
        case designModeActions.opens: return opensChangeOf(value);
        case designModeActions.enabled: return enabledChangeOf(value);
        case 'icon':
        case designModeActions.slice:
        case designModeActions.emphasis:
        case designModeActions.display: return { [actionId]: empty ? undefined : value };
        default: return undefined;
    }
}

// What a chip says for the item: what it is bound to, or what to do when it is bound to nothing.
export function bindingChips(item: OutletItem, context: OutletBindingContext): Record<string, string> {
    const bound = item as Bound;
    const text = context.strings;
    const chips: Record<string, string> = {};
    const sets = bound.sets as { query?: string; parameter?: string } | undefined;
    const valueFrom = bound.valueFrom as { query?: string; field?: string } | undefined;
    switch (item.kind) {
        case OutletItemKind.Filter:
            chips[designModeActions.sets] = sets?.query ? `${sets.query} › ${sets.parameter ?? ''}` : text.chooseParameter;
            chips[designModeActions.control] = text.controls[String(bound.control ?? FilterControl.Search)] ?? String(bound.control);
            break;
        case OutletItemKind.Tab:
            chips[designModeActions.shows] = typeof bound.shows === 'string' && bound.shows !== ''
                ? context.screens.find(screen => screen.id === bound.shows)?.label ?? bound.shows
                : text.chooseScreen;
            break;
        case OutletItemKind.Stat:
            chips[designModeActions.valueFrom] = valueFrom?.query ? `${valueFrom.query} › ${valueFrom.field ?? ''}` : text.chooseField;
            break;
        case OutletItemKind.Navigation: {
            const target = bound.target as { module?: string; feature?: string } | undefined;
            chips[designModeActions.target] = (context.structure ? targetLabel(context.structure, target) : target?.module) ?? '';
            break;
        }
        case OutletItemKind.Button:
        case OutletItemKind.MenuEntry:
            chips[designModeActions.opens] = context.placement
                ? opensChipText(hookOf(item, context), context.placement, context.placementStrings)
                : text.opensChoices[String(bound.opens ?? 'automatic')] ?? text.automatic;
            chips[designModeActions.enabled] = enabledChipText(hookOf(item, context), context.outletSubject, context.placementStrings);
            break;
    }
    return chips;
}

// Whether the item is bound to nothing yet, and so flagged: a button that runs nothing, a filter that sets nothing, a tab that shows nothing, a stat with no
// value, a navigation item that leads nowhere and has nothing under it.
export function isUnbound(item: OutletItem): boolean {
    const bound = item as Bound;
    switch (item.kind) {
        case OutletItemKind.Button:
        case OutletItemKind.MenuEntry: return !bound.slice && !bound.command && !bound.navigateTo && !bound.builtIn;
        case OutletItemKind.Filter: return !bound.sets;
        case OutletItemKind.Tab: return !bound.shows;
        case OutletItemKind.Stat: return !bound.valueFrom;
        case OutletItemKind.Navigation: return !bound.target && !(Array.isArray(bound.children) && bound.children.length > 0);
        default: return false;
    }
}
