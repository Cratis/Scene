// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { elementNodeId, screenNodeId, screenTemplateNodeId, slotNodeId } from '@cratis/scene.engine';
import { EditingScope, EditingScopeKind, SceneEdit, SceneEditKind, Screen, ScreenTemplate, Slot } from '@cratis/scene.model';
import { findComponent } from '../catalogue/outlets';
import { DesignOperation, DesignSlot } from './DesignOperation';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { ResolvedTarget, componentNameOf, createComponentElement, findElement, idsInDocument, newElementId, resolveTarget } from './documentLookup';
import { toSceneValue } from './designValues';

/**
 * One thing an operation comes down to. A change of a node is a Scene edit the engine applies; declaring a screen or a template, removing
 * a screen, changing the profile and keeping the screen set are what Scene edits do not cover.
 */
export type LoweredStep =
    | { kind: 'sceneEdit'; scope: EditingScope; edit: SceneEdit }
    | { kind: 'declareScreen'; screen: Screen }
    | { kind: 'declareTemplate'; template: ScreenTemplate }
    | { kind: 'removeScreen'; name: string }
    | { kind: 'profile'; key: string; value: string }
    | { kind: 'screenSet'; change: 'add' | 'remove' | 'move'; name: string; index?: number };

const scopeOf = (target: ResolvedTarget): EditingScope =>
    ({ kind: target.kind === 'screen' ? EditingScopeKind.Screen : EditingScopeKind.ScreenTemplate, name: target.name });

const ownerNodeId = (target: ResolvedTarget): string => target.kind === 'screen' ? screenNodeId(target.name) : screenTemplateNodeId(target.name);

const slotOf = (slot: DesignSlot): Slot => {
    const result: Slot = { name: slot.name };
    if (slot.description !== undefined) result.description = slot.description;
    if (slot.optional !== undefined) result.optional = slot.optional;
    if (slot.primary !== undefined) result.primary = slot.primary;
    if (slot.accepts !== undefined) result.accepts = [...slot.accepts];
    return result;
};

const emptyContent = (slots: readonly Slot[]): Record<string, never[]> => Object.fromEntries(slots.map(slot => [slot.name, []]));

function declareScreen(operation: Extract<DesignOperation, { op: 'addScreen' }>, workspace: DesignWorkspace, context: DesignContext): LoweredStep[] {
    const inDocument = workspace.document.screenTemplates.find(template => template.name === operation.template);
    const source = inDocument ?? context.templates.find(template => template.name === operation.template)!;
    const layout = workspace.profile?.layout ?? workspace.document.layouts[0]?.name ?? '';
    const screen: Screen = { name: operation.name, layout, screenTemplate: operation.template, slotContent: emptyContent(source.slots), forms: [], contributions: [] };
    return [
        ...(inDocument === undefined ? [{ kind: 'declareTemplate' as const, template: source }] : []),
        { kind: 'declareScreen', screen },
        { kind: 'screenSet', change: 'add', name: operation.name },
    ];
}

function declareTemplate(operation: Extract<DesignOperation, { op: 'addTemplate' }>): LoweredStep[] {
    const slots = operation.slots.map(slotOf);
    const template: ScreenTemplate = { name: operation.name, slots, content: emptyContent(slots) };
    if (operation.fitsSlot !== undefined) template.fitsSlot = operation.fitsSlot;
    if (operation.arrangement !== undefined) template.arrangement = operation.arrangement;
    if (operation.displayName !== undefined) template.displayName = operation.displayName;
    if (operation.description !== undefined) template.description = operation.description;
    if (operation.type !== undefined) template.metadata = { type: operation.type };
    if (operation.outlets !== undefined) template.outlets = operation.outlets as ScreenTemplate['outlets'];
    return [{ kind: 'declareTemplate', template }];
}

function changeTemplate(operation: Extract<DesignOperation, { op: 'addSlot' | 'removeSlot' | 'arrange' }>, workspace: DesignWorkspace): LoweredStep[] {
    const template = workspace.document.screenTemplates.find(candidate => candidate.name === operation.template)!;
    if (operation.op === 'arrange') return [{ kind: 'declareTemplate', template: { ...template, arrangement: operation.arrangement } }];
    if (operation.op === 'removeSlot') {
        const content = { ...(template.content ?? {}) };
        delete content[operation.slot];
        return [{ kind: 'declareTemplate', template: { ...template, slots: template.slots.filter(slot => slot.name !== operation.slot), content } }];
    }
    const position = operation.index === undefined ? template.slots.length : Math.max(0, Math.min(template.slots.length, operation.index));
    const slots = [...template.slots.slice(0, position), slotOf(operation.slot), ...template.slots.slice(position)];
    return [{ kind: 'declareTemplate', template: { ...template, slots, content: { ...(template.content ?? {}), [operation.slot.name]: [] } } }];
}

function lowerContent(operation: Extract<DesignOperation, { op: 'insert' | 'set' | 'remove' | 'move' | 'link' }>, workspace: DesignWorkspace, context: DesignContext): LoweredStep[] {
    const target = resolveTarget(workspace.document, operation)!;
    const scope = scopeOf(target);
    switch (operation.op) {
        case 'insert': {
            const component = findComponent(context.catalogue, operation.component)!;
            const properties = Object.fromEntries(Object.entries(operation.props ?? {}).map(([name, value]) => [name, toSceneValue(component, name, value)]));
            const id = operation.id ?? newElementId(workspace.document, component.name, idsInDocument(workspace.document));
            const edit: SceneEdit = {
                kind: SceneEditKind.InsertNode, target: slotNodeId(ownerNodeId(target), operation.outlet), element: createComponentElement(id, component.name, properties),
                ...(operation.index === undefined ? {} : { index: operation.index }),
            };
            return [{ kind: 'sceneEdit', scope, edit }];
        }
        case 'set': {
            const component = findComponent(context.catalogue, componentNameOf(findElement(target, operation.element)!.element))!;
            return [{ kind: 'sceneEdit', scope, edit: { kind: SceneEditKind.SetProperty, nodeId: elementNodeId(operation.element), path: operation.prop, value: toSceneValue(component, operation.prop, operation.value) } }];
        }
        case 'remove':
            return [{ kind: 'sceneEdit', scope, edit: { kind: SceneEditKind.RemoveNode, nodeId: elementNodeId(operation.element) } }];
        case 'move':
            return [{ kind: 'sceneEdit', scope, edit: { kind: SceneEditKind.MoveNode, nodeId: elementNodeId(operation.element), target: slotNodeId(ownerNodeId(target), operation.outlet), ...(operation.index === undefined ? {} : { index: operation.index }) } }];
        case 'link': {
            const component = findComponent(context.catalogue, componentNameOf(findElement(target, operation.element)!.element))!;
            const prop = operation.prop ?? component.properties.find(property => property.kind === 'destination')!.name;
            return [{ kind: 'sceneEdit', scope, edit: { kind: SceneEditKind.SetProperty, nodeId: elementNodeId(operation.element), path: prop, value: { screen: operation.to } } }];
        }
    }
}

/** Lowers a checked operation to the steps that carry it out. Variations, tweaks and refusals change nothing, so they lower to nothing. */
export function lowerOperation(operation: DesignOperation, workspace: DesignWorkspace, context: DesignContext): LoweredStep[] {
    switch (operation.op) {
        case 'addScreen': return declareScreen(operation, workspace, context);
        case 'removeScreen': return [{ kind: 'removeScreen', name: operation.name }, { kind: 'screenSet', change: 'remove', name: operation.name }];
        case 'moveScreen': return [{ kind: 'screenSet', change: 'move', name: operation.name, index: operation.index }];
        case 'addTemplate': return declareTemplate(operation);
        case 'addSlot':
        case 'removeSlot':
        case 'arrange': return changeTemplate(operation, workspace);
        case 'insert':
        case 'set':
        case 'remove':
        case 'move':
        case 'link': return lowerContent(operation, workspace, context);
        case 'profile': return [{ kind: 'profile', key: operation.key, value: operation.value }];
        default: return [];
    }
}
