// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GridUnitType, type FlowNode, type Panel, type SceneElement, type ScreenTemplate } from '@cratis/scene.model';
import { screenTemplateNodeId, slotNodeId } from '@cratis/scene.engine';
import { LayoutItem } from '../Layouts/LayoutItem';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';
import { contentSlot } from '../Document/studioScreen';

// A screen template that the Screenplay import (or a blueprint) made declares the slots it is made of - a product grid's header, filters and
// products, a summary layout's main region and summary - and says in its arrangement how they share the space. The editor's own templates
// have one `content` slot that a root panel fills. When a template is authored, each slot it declares is drawn as a section of its own, in the
// arrangement the template gives them, holding what the template puts there, so a template opens as the shape it is and not as one empty
// place (StudioIssues#902). A section belongs to no document: it is the place a slot's content is drawn, and dropping into it inserts into
// that slot of the template.

const slotSectionPrefix = 'template-slot:';
const slotLabelPrefix = 'template-slot-label:';

// How wide a slot is drawn that sits beside one that grows and has no share of its own: the arrangement of a Scene document does not carry a slot's
// width in pixels, so the editor draws a side region at a width that reads as a side region.
const sideRegionWidth = 280;

const flowOf = (template: ScreenTemplate): FlowNode | undefined => {
    const arrangement = template.arrangement as { root?: FlowNode } | undefined;
    return arrangement?.root && typeof arrangement.root === 'object' ? arrangement.root : undefined;
};

type Container = FlowNode & { kind?: string; children?: FlowNode[]; gap?: number };
type Leaf = FlowNode & { slotName?: string };

export const slotSectionId = (slot: string): string => `${slotSectionPrefix}${slot}`;

// Whether an element of the composition is the section a slot is drawn in rather than something the document holds.
export const isSlotSection = (id: string): boolean => id.startsWith(slotSectionPrefix);

// Whether an element of the composition is the name a section carries.
export const isSlotLabel = (id: string): boolean => id.startsWith(slotLabelPrefix);

export const slotOfSection = (id: string): string => id.slice(slotSectionPrefix.length);

// A template is drawn in sections when it declares a slot of its own beside, or instead of, the single content slot the editor's templates have.
export const needsSlotSections = (template: ScreenTemplate): boolean => template.slots.some(slot => slot.name !== contentSlot);

// The node a drop into a section inserts at: the slot of the template being authored. Anything else is an element of the document.
export function slotTargetOf(parentId: string, authoredTemplate: string | undefined): string | undefined {
    return authoredTemplate !== undefined && isSlotSection(parentId)
        ? slotNodeId(screenTemplateNodeId(authoredTemplate), slotOfSection(parentId))
        : undefined;
}

// A section holds the name of its slot ahead of what the slot holds, so a position among the section's children is one past the position in the slot.
export const slotIndexOf = (parentId: string, index: number): number => isSlotSection(parentId) ? Math.max(0, index - 1) : index;

// What a slot's label says: its name, then its role and whether it is routed - role is what slices match against, never the name (6b, StudioIssues#1330).
export function slotLabelOf(template: ScreenTemplate, slot: string): string {
    const declared = template.slots.find(candidate => candidate.name === slot);
    const routed = declared?.routed ? (declared.routedBy && declared.routedBy.length > 0 ? `routed by ${declared.routedBy.join(', ')}` : 'routed') : undefined;
    return [`slot: ${slot}`, declared?.role, routed, declared?.primary ? 'primary' : undefined, declared?.optional ? 'optional' : undefined]
        .filter((part): part is string => typeof part === 'string' && part !== '')
        .join(' · ');
}

const section = (template: ScreenTemplate, slot: string, labelled: boolean): Panel => {
    const label = createExternalComponent(`${slotLabelPrefix}${slot}`, slot, 'core:text', { text: slotLabelOf(template, slot) });
    return createPanel(LayoutItem.Stack, slotSectionId(slot), slot, [...(labelled ? [label] : []), ...(template.content?.[slot] ?? [])]);
};

const star = (value: number) => ({ unitType: GridUnitType.Star, value });
const absolute = (value: number) => ({ unitType: GridUnitType.Absolute, value });

// The slots of the arrangement as panels. A row is a grid whose columns share the space the way the arrangement says (a child that grows takes
// its share, one that does not sits at a side region's width); a column stacks its children.
function arranged(template: ScreenTemplate, node: FlowNode, drawn: Set<string>, labelled: boolean): SceneElement | undefined {
    const leaf = node as Leaf;
    if (typeof leaf.slotName === 'string') {
        if (drawn.has(leaf.slotName) || !template.slots.some(slot => slot.name === leaf.slotName)) return undefined;
        drawn.add(leaf.slotName);
        return section(template, leaf.slotName, labelled);
    }

    const container = node as Container;
    const children = (container.children ?? []).map(child => ({ child, element: arranged(template, child, drawn, labelled) })).filter(entry => entry.element !== undefined) as { child: FlowNode; element: SceneElement }[];
    if (children.length === 0) return undefined;
    const name = container.kind === 'Row' ? 'row' : 'column';
    if (container.kind !== 'Row') {
        const panel = createPanel(LayoutItem.Stack, `template-flow:${name}-${[...drawn].join('-')}`, name, children.map(entry => entry.element));
        return { ...panel, spacing: container.gap ?? 8 } as unknown as SceneElement;
    }

    const grid = createPanel(
        LayoutItem.Grid,
        `template-flow:${name}-${[...drawn].join('-')}`,
        name,
        children.map((entry, index) => ({ ...entry.element, properties: { ...entry.element.properties, 'Grid.Column': index, 'Grid.Row': 0 } }) as SceneElement));
    return {
        ...grid,
        rows: [],
        columns: children.map(entry => ({ width: (entry.child.grow ?? 0) > 0 ? star(entry.child.grow!) : (entry.child as Leaf).slotName !== undefined ? absolute(sideRegionWidth) : star(1), minimumWidth: 0, maximumWidth: Number.POSITIVE_INFINITY }))
    } as unknown as SceneElement;
}

/**
 * The slots of a template as the sections they are drawn in.
 *
 * @param template The template being authored.
 * @param labelled Whether each section starts with the name of its slot - the editor says what each place is; a preview draws only what is in it.
 * @returns The elements the template is drawn as, and the id of the section a component goes into when no place is named - the first slot it declares.
 */
export function slotSectionsOf(template: ScreenTemplate, labelled = true): { elements: SceneElement[]; entry: string | undefined } {
    const drawn = new Set<string>();
    const flow = flowOf(template);
    const elements: SceneElement[] = [];
    const root = flow ? arranged(template, flow, drawn, labelled) : undefined;
    if (root) elements.push(root);

    // A slot the arrangement does not place is still a slot of the template, so it is drawn - below what the arrangement places.
    for (const slot of template.slots) {
        if (!drawn.has(slot.name)) {
            drawn.add(slot.name);
            elements.push(section(template, slot.name, labelled));
        }
    }

    return { elements, entry: template.slots[0] ? slotSectionId(template.slots[0].name) : undefined };
}
