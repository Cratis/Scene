// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, DialogTemplate, ExternalComponent, FlowArrangement, FlowContainer, FlowLeaf, FlowNode,
    FreeformArrangement, FreeformSlotArrangement, Layout, LayoutType, SceneDocument, SceneElement, SceneNodeKind, Screen,
    ScreenTemplate, Slot, FlowContainerKind,
} from '@cratis/scene.model';
import { isContentControl, isExternalComponent, isItemsControl, isPanel } from '../elementKind';
import { isFlowContainer, isFlowLeaf, isFlowSlotLeaf } from '../flowNodeKind';
import { isCanvas, isDockPanel, isGrid, isStackPanel, isWrapPanel } from '../panelKind';
import { errorDiagnostic } from './diagnostics';
import { DocumentIndex, DocumentPath, ListLocation, NodeRecord } from './DocumentIndex';
import {
    dialogTemplateNodeId, elementNodeId, flowNodeId, freeformNodeId, layoutNodeId, ownerArrangementId, placementNodeId,
    screenNodeId, screenTemplateNodeId, slotNodeId,
} from './nodeIds';

type Owner = Layout | ScreenTemplate | DialogTemplate | Screen;

interface OwnerContext {
    owner: string;
    ownerKind: SceneNodeKind;
    ownerId: string;
}

interface Placement {
    parentId?: string;
    list?: ListLocation;
    leafId?: string;
    mirror?: NodeRecord['mirror'];
}

/**
 * The layout type a panel element is, by its shape.
 */
export function panelLayoutType(element: SceneElement): LayoutType | undefined {
    if (!isPanel(element)) return undefined;
    if (isGrid(element)) return LayoutType.GridPanel;
    if (isCanvas(element)) return LayoutType.Canvas;
    if (isDockPanel(element)) return LayoutType.DockPanel;
    if (isStackPanel(element)) return LayoutType.StackPanel;
    if (isWrapPanel(element)) return LayoutType.WrapPanel;
    return undefined;
}

/**
 * The layout type a flow node is.
 */
export function flowLayoutType(node: FlowNode): LayoutType {
    if (isFlowContainer(node)) {
        switch (node.kind) {
            case FlowContainerKind.Row: return LayoutType.FlowRow;
            case FlowContainerKind.Column: return LayoutType.FlowColumn;
            default: return LayoutType.FlowGrid;
        }
    }

    return isFlowSlotLeaf(node) ? LayoutType.FlowSlotLeaf : LayoutType.FlowLeaf;
}

class Indexer {
    readonly index: DocumentIndex = { nodes: new Map(), diagnostics: [] };

    constructor(private readonly document: SceneDocument) {}

    run(): DocumentIndex {
        this.document.layouts.forEach((layout, position) =>
            this.owner(layout, ['layouts', position], { owner: layout.name, ownerKind: SceneNodeKind.Layout, ownerId: layoutNodeId(layout.name) }, undefined));
        this.document.screenTemplates.forEach((template, position) =>
            this.owner(template, ['screenTemplates', position], { owner: template.name, ownerKind: SceneNodeKind.ScreenTemplate, ownerId: screenTemplateNodeId(template.name) }, 'content'));
        this.document.dialogTemplates.forEach((dialog, position) =>
            this.owner(dialog, ['dialogTemplates', position], { owner: dialog.name, ownerKind: SceneNodeKind.DialogTemplate, ownerId: dialogTemplateNodeId(dialog.name) }, 'content'));
        this.document.screens.forEach((screen, position) =>
            this.owner(screen, ['screens', position], { owner: screen.name, ownerKind: SceneNodeKind.Screen, ownerId: screenNodeId(screen.name) }, 'slotContent'));
        return this.index;
    }

    private add(record: NodeRecord): boolean {
        if (this.index.nodes.has(record.id)) return false;
        this.index.nodes.set(record.id, record);
        return true;
    }

    private owner(owner: Owner, path: DocumentPath, context: OwnerContext, contentKey: 'content' | 'slotContent' | undefined): void {
        this.add({ id: context.ownerId, kind: context.ownerKind, typeId: context.ownerKind, label: owner.name, path, value: owner, owner: context.owner, ownerKind: context.ownerKind });

        const content = contentKey === undefined ? undefined : (owner as unknown as Record<string, Record<string, SceneElement[]> | undefined>)[contentKey];
        const ownsSlots = 'slots' in owner;
        const declared: Slot[] = ownsSlots ? owner.slots : this.slotsAvailableTo(owner as Screen);
        const slotNames = new Set<string>([...declared.map(slot => slot.name), ...Object.keys(content ?? {})]);

        for (const name of slotNames) {
            const slotId = slotNodeId(context.ownerId, name);
            const declaration = ownsSlots ? declared.findIndex(slot => slot.name === name) : -1;
            const contentPath: DocumentPath | undefined = contentKey === undefined ? undefined : [...path, contentKey, name];
            this.add({
                id: slotId, kind: SceneNodeKind.Slot, typeId: 'slot', label: name, path: declaration >= 0 ? [...path, 'slots', declaration] : contentPath!,
                value: declaration >= 0 ? declared[declaration] : content?.[name], parentId: context.ownerId, owner: context.owner,
                ownerKind: context.ownerKind, slotName: name, contentPath,
            });

            if (declaration >= 0 && declared[declaration].arrangement) {
                this.arrangement(declared[declaration].arrangement!, [...path, 'slots', declaration, 'arrangement'], slotId, context);
            }

            (content?.[name] ?? []).forEach((element, position) =>
                this.element(element, [...contentPath!, position], context, { parentId: slotId, list: { path: contentPath!, index: position } }));
        }

        if ('arrangement' in owner && owner.arrangement) {
            this.arrangement(owner.arrangement, [...path, 'arrangement'], ownerArrangementId(context.ownerId), context, context.ownerId);
        }

        if ('contributions' in owner) {
            owner.contributions.forEach((contribution, position) =>
                this.element(contribution.content, [...path, 'contributions', position, 'content'], context, { parentId: context.ownerId }));
        }
    }

    private slotsAvailableTo(screen: Screen): Slot[] {
        const template = screen.screenTemplate === undefined ? undefined : this.document.screenTemplates.find(candidate => candidate.name === screen.screenTemplate);
        if (template) return template.slots;
        return this.document.layouts.find(candidate => candidate.name === screen.layout)?.slots ?? [];
    }

    private element(element: SceneElement, path: DocumentPath, context: OwnerContext, placement: Placement): boolean {
        const id = elementNodeId(element.id);
        const panelType = panelLayoutType(element);
        const typeId = isExternalComponent(element) ? element.componentName
            : (panelType ?? (isContentControl(element) ? 'contentControl' : (isItemsControl(element) ? 'itemsControl' : 'element')));
        const properties = (element as ExternalComponent).properties;
        const label = (typeof properties?.label === 'string' && properties.label)
            || (isPanel(element) && (element as { name?: string }).name)
            || (isExternalComponent(element) && element.name)
            || typeId;

        if (!this.add({
            id, kind: SceneNodeKind.Element, typeId, label, path, value: element, owner: context.owner, ownerKind: context.ownerKind, ...placement,
        })) {
            this.index.diagnostics.push(errorDiagnostic(DiagnosticCode.DuplicateElementId, `The element id '${element.id}' is used more than once.`, { nodeId: id }));
            return false;
        }

        if (isExternalComponent(element)) {
            for (const [name, children] of Object.entries(element.slots)) {
                children.forEach((child, position) =>
                    this.element(child, [...path, 'slots', name, position], context, { parentId: id, list: { path: [...path, 'slots', name], index: position }, mirror: placement.mirror }));
            }
        } else if (isContentControl(element)) {
            this.element(element.content, [...path, 'content'], context, { parentId: id, mirror: placement.mirror });
        } else if (isItemsControl(element)) {
            this.element(element.itemTemplate, [...path, 'itemTemplate'], context, { parentId: id, mirror: placement.mirror });
        } else if (isPanel(element)) {
            element.children.forEach((child, position) =>
                this.element(child, [...path, 'children', position], context, { parentId: id, list: { path: [...path, 'children'], index: position }, mirror: placement.mirror }));
        }

        return true;
    }

    private arrangement(arrangement: unknown, path: DocumentPath, holderId: string, context: OwnerContext, parentId = holderId): void {
        if ((arrangement as FlowArrangement).root !== undefined) {
            const flow = arrangement as FlowArrangement;
            this.flowNode(flow.root, [...path, 'root'], holderId, 'root', [], context, { parentId });
            flow.overrides?.forEach((override, position) =>
                this.flowNode(override.root, [...path, 'overrides', position, 'root'], holderId, `override${position}`, [], context, { parentId }));
            return;
        }

        const variants = (arrangement as FreeformArrangement | FreeformSlotArrangement).variants;
        if (!Array.isArray(variants)) return;

        const freeformId = freeformNodeId(holderId);
        this.add({ id: freeformId, kind: SceneNodeKind.Freeform, typeId: LayoutType.Freeform, label: 'Freeform', path, value: arrangement, parentId, owner: context.owner, ownerKind: context.ownerKind });

        const firstCopy = new Map<string, DocumentPath>();
        variants.forEach((variant, variantIndex) => {
            (variant.placements as { element?: SceneElement; slotName?: string }[]).forEach((placement, placementIndex) => {
                const placementPath = [...path, 'variants', variantIndex, 'placements', placementIndex];
                const key = placement.element?.id ?? placement.slotName ?? String(placementIndex);
                const placementId = placementNodeId(holderId, variantIndex, key);
                this.add({
                    id: placementId, kind: SceneNodeKind.Placement, typeId: 'placement', label: key, path: placementPath, value: placement,
                    parentId: freeformId, owner: context.owner, ownerKind: context.ownerKind,
                    list: { path: [...path, 'variants', variantIndex, 'placements'], index: placementIndex },
                });

                if (!placement.element) return;
                const elementPath = [...placementPath, 'element'];
                const known = this.index.nodes.get(elementNodeId(placement.element.id));
                const original = firstCopy.get(placement.element.id);
                if (known && original) {
                    known.placementIds!.push(placementId);
                    known.mirror!.others.push(elementPath);
                    return;
                }

                firstCopy.set(placement.element.id, elementPath);
                const mirror = { prefix: elementPath, others: [] as DocumentPath[] };
                if (this.element(placement.element, elementPath, context, { parentId: placementId, mirror })) {
                    this.index.nodes.get(elementNodeId(placement.element.id))!.placementIds = [placementId];
                }
            });
        });

        // Descendants of a freeform element carry the same mirror object, so a copy found later is seen by all of them.
    }

    private flowNode(node: FlowNode, path: DocumentPath, holderId: string, variant: string, indexPath: number[], context: OwnerContext, placement: Placement): void {
        const id = flowNodeId(holderId, variant, indexPath);
        const type = flowLayoutType(node);
        this.add({ id, kind: SceneNodeKind.FlowNode, typeId: type, label: type, path, value: node, owner: context.owner, ownerKind: context.ownerKind, ...placement });

        if (isFlowContainer(node)) {
            (node as FlowContainer).children.forEach((child, position) =>
                this.flowNode(child, [...path, 'children', position], holderId, variant, [...indexPath, position], context,
                    { parentId: id, list: { path: [...path, 'children'], index: position } }));
        } else if (isFlowLeaf(node)) {
            this.element((node as FlowLeaf).content, [...path, 'content'], context, { parentId: id, leafId: id });
        }

    }
}

/**
 * Indexes every addressable node of a document: layouts, templates, dialog templates, screens, their slots, the
 * elements in them, and the flow and freeform arrangements that position them.
 *
 * The index is what inspection and editing look nodes up in. Duplicate element ids are reported, and the second
 * occurrence is left out of the index.
 *
 * @param document The document to index.
 */
export function indexDocument(document: SceneDocument): DocumentIndex {
    return new Indexer(document).run();
}
