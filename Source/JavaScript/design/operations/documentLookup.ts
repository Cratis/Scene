// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneDocument, SceneElement, Screen, ScreenTemplate } from '@cratis/scene.model';
import { DesignTarget } from './DesignOperation';

/** The screen or the screen template an operation applies to. */
export type ResolvedTarget =
    | { kind: 'screen'; name: string; value: Screen }
    | { kind: 'template'; name: string; value: ScreenTemplate };

/** An element found in the content of a target, and the outlet (slot) whose content holds it. */
export interface PlacedElement {
    element: SceneElement;
    outlet: string;
}

const children = (element: SceneElement): SceneElement[] => {
    const record = element as unknown as Record<string, unknown>;
    const found: SceneElement[] = [];
    const take = (value: unknown) => { if (typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string') found.push(value as SceneElement); };
    if (Array.isArray(record.children)) record.children.forEach(take);
    if (typeof record.slots === 'object' && record.slots !== null) Object.values(record.slots as Record<string, unknown>).forEach(list => Array.isArray(list) && list.forEach(take));
    take(record.content);
    take(record.itemTemplate);
    return found;
};

/** Resolves the screen or template an operation names; undefined when it names neither or one that is not in the document. */
export function resolveTarget(document: SceneDocument, target: DesignTarget): ResolvedTarget | undefined {
    if (target.screen !== undefined) {
        const screen = document.screens.find(candidate => candidate.name === target.screen);
        return screen === undefined ? undefined : { kind: 'screen', name: screen.name, value: screen };
    }
    if (target.template !== undefined) {
        const template = document.screenTemplates.find(candidate => candidate.name === target.template);
        return template === undefined ? undefined : { kind: 'template', name: template.name, value: template };
    }
    return undefined;
}

/** The content of a target by outlet: a screen's slot content, or a template's own content. */
export function contentOf(target: ResolvedTarget): Record<string, SceneElement[]> {
    return (target.kind === 'screen' ? target.value.slotContent : target.value.content) ?? {};
}

/** The outlets a target has: for a screen, the slots of its template (else of its layout); for a template, its own slots. */
export function outletNamesOf(document: SceneDocument, target: ResolvedTarget): string[] {
    if (target.kind === 'template') return target.value.slots.map(slot => slot.name);
    const template = target.value.screenTemplate === undefined ? undefined : document.screenTemplates.find(candidate => candidate.name === target.value.screenTemplate);
    const slots = template?.slots ?? document.layouts.find(layout => layout.name === target.value.layout)?.slots ?? [];
    return [...new Set([...slots.map(slot => slot.name), ...Object.keys(target.value.slotContent)])];
}

/** Finds an element anywhere in a target's content. */
export function findElement(target: ResolvedTarget, id: string): PlacedElement | undefined {
    const search = (element: SceneElement, outlet: string): PlacedElement | undefined => {
        if (element.id === id) return { element, outlet };
        for (const child of children(element)) {
            const found = search(child, outlet);
            if (found !== undefined) return found;
        }
        return undefined;
    };
    for (const [outlet, elements] of Object.entries(contentOf(target))) {
        for (const element of elements) {
            const found = search(element, outlet);
            if (found !== undefined) return found;
        }
    }
    return undefined;
}

/** Every element placed directly in an outlet or nested inside one, in document order. */
export function allElements(target: ResolvedTarget): PlacedElement[] {
    const found: PlacedElement[] = [];
    const walk = (element: SceneElement, outlet: string) => { found.push({ element, outlet }); children(element).forEach(child => walk(child, outlet)); };
    for (const [outlet, elements] of Object.entries(contentOf(target))) elements.forEach(element => walk(element, outlet));
    return found;
}

export const componentNameOf = (element: SceneElement): string => {
    const name = (element as { componentName?: unknown }).componentName;
    return typeof name === 'string' ? name : '';
};

function collectIds(value: unknown, ids: Set<string>): void {
    if (Array.isArray(value)) {
        value.forEach(item => collectIds(item, ids));
    } else if (typeof value === 'object' && value !== null) {
        const record = value as Record<string, unknown>;
        if (typeof record.id === 'string') ids.add(record.id);
        Object.values(record).forEach(item => collectIds(item, ids));
    }
}

/** Every id used anywhere in the document: element ids must be unique across all of it. */
export function idsInDocument(document: SceneDocument): Set<string> {
    const ids = new Set<string>();
    collectIds(document, ids);
    return ids;
}

const kebab = (name: string): string => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '').replace(/[^a-z0-9-]/g, '-');

/** An id no part of the document uses: the component's bare name in kebab case and the first free counter. Deterministic. */
export function newElementId(document: SceneDocument, componentName: string, taken: ReadonlySet<string> = idsInDocument(document)): string {
    const stem = kebab(componentName.slice(componentName.lastIndexOf(':') + 1));
    for (let counter = 1; ; counter++) {
        const id = `${stem}-${counter}`;
        if (!taken.has(id)) return id;
    }
}

/** A Scene component element with the defaults every element carries. */
export function createComponentElement(id: string, componentName: string, properties: Record<string, unknown>): ExternalComponent {
    return {
        id, name: id, componentName, properties, slots: {},
        visibility: 'Visible', isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: 'Stretch', verticalAlignment: 'Stretch',
    } as unknown as ExternalComponent;
}
