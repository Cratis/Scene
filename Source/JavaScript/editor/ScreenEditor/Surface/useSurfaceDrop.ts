// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useRef, useState, type DragEvent, type RefObject } from 'react';
import { DropRegionKind } from '../DropRegions/DropRegionKind';
import { insertedComponentName } from '../Palette/insertedComponentName';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { Ownership } from '../Structure/Ownership';
import { StructureEditRejection } from '../Structure/StructureEditRejection';
import { surfaceMoveEdit } from '../Structure/surfaceMoveEdit';
import type { PlacedRegion } from './dropRegionRects';
import { tableDropAt } from './columnAt';
import { surfaceOrigin } from './elementRect';
import { isElementDrag, isSurfaceDrag, readElementDrag, readPaletteDrag } from './dragPayload';
import { resolveDropTarget, type ResolvedDrop } from './resolveDropTarget';

// What the surface shows while something is dragged over it: where it would land, or that it cannot land there.
// Where the pointer is on the surface, in the surface's own pixels: the page's scale (the board's zoom) is taken out, as the regions are measured the same way.
function pointOnSurface(root: HTMLElement, event: { clientX: number; clientY: number }) {
    const origin = surfaceOrigin(root);
    return { left: (event.clientX - origin.left) / (origin.scaleX ?? 1), top: (event.clientY - origin.top) / (origin.scaleY ?? 1) };
}

export interface DragFeedback {
    drop?: ResolvedDrop;
    denied: boolean;
}

const sameRect = (left?: { top: number; left: number; width: number; height: number }, right?: { top: number; left: number; width: number; height: number }): boolean =>
    left?.top === right?.top && left?.left === right?.left && left?.width === right?.width && left?.height === right?.height;

const sameFeedback = (left: DragFeedback | undefined, right: DragFeedback): boolean =>
    !!left && left.denied === right.denied && left.drop?.target.region.id === right.drop?.target.region.id && sameRect(left.drop?.target.rect, right.drop?.target.rect);

type Controller = Pick<ScreenEditorController, 'insertComponent' | 'insertLayout' | 'insertDataField' | 'ownershipOf' | 'move' | 'validateMove' | 'composition' | 'adapter'>;

// Drag and drop onto the surface, of a new item from the toolbar or of an element already on the screen. Every position over the surface
// resolves to a drop - the pointer is never over a place that is neither a target nor refused - and the same resolution decides what is
// shown and what a release does, so a drop lands where the marker was.
export function useSurfaceDrop(surface: RefObject<HTMLDivElement | null>, measureNow: () => PlacedRegion[], controller: Controller) {
    const [feedback, setFeedback] = useState<DragFeedback>();
    const feedbackRef = useRef<DragFeedback | undefined>(undefined);
    feedbackRef.current = feedback;
    const [draggedId, setDraggedId] = useState<string>();
    const depth = useRef(0);
    // The browser keeps what is being dragged unreadable until it is dropped, so the element being moved is remembered from the start.
    const dragged = useRef<string | undefined>(undefined);

    const clear = useCallback(() => { depth.current = 0; dragged.current = undefined; setDraggedId(undefined); setFeedback(undefined); }, []);

    // Escape cancels the drag: the marker goes at once, and what is released afterwards lands nowhere. The browser cancels a native drag on
    // its own; this makes the surface say so the moment the key goes down rather than when the browser gets round to reporting it.
    const cancelled = useRef(false);
    useEffect(() => {
        const cancel = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || (!dragged.current && !depth.current && !feedbackRef.current)) return;
            cancelled.current = true;
            clear();
        };
        window.addEventListener('keydown', cancel, true);
        return () => window.removeEventListener('keydown', cancel, true);
    }, [clear]);

    // A drag that ends anywhere - released outside the window, cancelled with Escape - must not leave a marker behind.
    useEffect(() => {
        window.addEventListener('dragend', clear);
        window.addEventListener('drop', clear);
        return () => { window.removeEventListener('dragend', clear); window.removeEventListener('drop', clear); };
    }, [clear]);

    const startMoving = useCallback((elementId: string) => { dragged.current = elementId; setDraggedId(elementId); }, []);

    const moveFor = (drop: ResolvedDrop) => {
        const moved = dragged.current;
        const { region } = drop.target;
        if (!moved || !region.containerId) return undefined;
        const markerIndex = region.kind === DropRegionKind.Container ? childCount(region.containerId) : region.index;
        return surfaceMoveEdit(controller.composition.roots, controller.adapter, moved, region.containerId, markerIndex);
    };

    const childCount = (containerId: string): number => {
        const stack = [...controller.composition.roots];
        while (stack.length > 0) {
            const node = stack.pop()!;
            if (controller.adapter.idOf(node) === containerId) return controller.adapter.childrenOf(node).length;
            stack.push(...controller.adapter.childrenOf(node));
        }
        return 0;
    };

    const resolve = (event: DragEvent): DragFeedback => {
        const point = pointOnSurface(surface.current!, event);
        const drop = resolveDropTarget(measureNow(), point.left, point.top);
        const hit = (event.target as HTMLElement).closest<HTMLElement>('[data-scene-id], [data-studio-element]');
        const hitId = hit?.dataset.sceneId ?? hit?.dataset.studioElement;
        const locked = !!hitId && controller.ownershipOf(hitId) !== Ownership.Local;
        if (!drop || locked) return { denied: true };

        // An element being moved is refused where the move would be: into itself, into something a template owns.
        if (isElementDrag(event)) {
            const edit = moveFor(drop);
            const rejection = edit ? controller.validateMove(edit) : StructureEditRejection.NodeNotFound;
            if (rejection && rejection !== StructureEditRejection.NoChange) return { denied: true };
        }

        return { drop, denied: false };
    };

    // Where the pointer let go, in the receiving container's own pixels: what a canvas puts the element at.
    const pointInContainer = (event: DragEvent, drop: ResolvedDrop) => {
        const point = pointOnSurface(surface.current!, event);
        return { left: point.left - drop.container.left, top: point.top - drop.container.top };
    };

    const onDragEnter = (event: DragEvent) => {
        if (!isSurfaceDrag(event)) return;
        event.preventDefault();
        cancelled.current = false;
        depth.current += 1;
    };

    const onDragOver = (event: DragEvent) => {
        if (!isSurfaceDrag(event)) return;
        event.preventDefault();
        if (cancelled.current) return;
        const next = resolve(event);
        event.dataTransfer.dropEffect = next.denied ? 'none' : isElementDrag(event) ? 'move' : 'copy';
        setFeedback(previous => sameFeedback(previous, next) ? previous : next);
    };

    const onDragLeave = (event: DragEvent) => {
        if (!isSurfaceDrag(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setFeedback(undefined);
    };

    const onDrop = (event: DragEvent) => {
        if (!isSurfaceDrag(event)) return;
        const elementId = readElementDrag(event);
        const payload = readPaletteDrag(event);
        const { drop, denied } = resolve(event);
        const edit = drop && elementId ? moveFor(drop) : undefined;
        const wasCancelled = cancelled.current;
        event.preventDefault();
        clear();
        cancelled.current = false;
        if (wasCancelled || denied || !drop) return;

        if (elementId) {
            // Where the pointer let go in the container's own pixels: the element's place when the container is a canvas.
            if (edit) controller.move(edit, pointInContainer(event, drop));
            return;
        }

        if (!payload) return;
        const { region } = drop.target;
        const parent = region.containerId ?? undefined;
        const index = region.kind === DropRegionKind.Container ? undefined : region.index;
        const at = pointInContainer(event, drop);
        if (payload.kind === 'layout') controller.insertLayout(payload.item, parent, index, at);
        else if (payload.kind === 'field') controller.insertDataField(payload.field, parent, index, at, tableDropAt(event.target, event.clientX));
        else controller.insertComponent(insertedComponentName(payload.componentName, payload.package), parent, index, at);
    };

    return { feedback, draggedId, startMoving, endMoving: clear, handlers: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}
