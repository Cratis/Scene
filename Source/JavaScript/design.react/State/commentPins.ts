// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CommentPosition, DesignComment, DesignSessionEvent } from '@cratis/scene.design';
import type { DesignIds } from '../Host/DesignCanvasHost';

/** An element of a screen as it is drawn, in the artboard's own pixels. */
export interface ElementBox {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

const contains = (box: ElementBox, point: CommentPosition): boolean =>
    point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height;

/** The element under a point: the smallest of those that hold it, since an element is drawn inside the ones it belongs to. */
export function elementAt(point: CommentPosition, boxes: readonly ElementBox[]): ElementBox | undefined {
    let found: ElementBox | undefined;
    for (const box of boxes) {
        if (!contains(box, point)) continue;
        if (found === undefined || box.width * box.height <= found.width * found.height) found = box;
    }
    return found;
}

/** What a pin is anchored to: the element under it, or - only when no element is - the place it was put. */
export type PinAnchor = { elementId: string } | { position: CommentPosition };

/** Anchors a pin dropped at a point. The AI is told comments by element, so an element wins whenever there is one. */
export function anchorPin(point: CommentPosition, boxes: readonly ElementBox[]): PinAnchor {
    const box = elementAt(point, boxes);
    return box === undefined ? { position: { x: Math.round(point.x), y: Math.round(point.y) } } : { elementId: box.id };
}

/** Where a comment's pin is drawn. */
export interface PlacedPin {
    comment: DesignComment;
    x: number;
    y: number;
    /** Whether the pin follows an element of the screen; false when it stays where it was put, or the element is gone. */
    anchored: boolean;
}

const pinInset = 10;

/**
 * Where each comment of a screen has its pin: on the corner of its element while the element is there, else at the position it was pinned to.
 * A comment whose element is gone and that was never pinned has no place on the screen - it is returned apart, to be shown in the list.
 */
export function placePins(comments: readonly DesignComment[], screen: string, boxes: readonly ElementBox[]): { placed: PlacedPin[]; unplaced: DesignComment[] } {
    const placed: PlacedPin[] = [];
    const unplaced: DesignComment[] = [];
    for (const comment of comments.filter(candidate => candidate.screen === screen)) {
        const box = comment.elementId === undefined ? undefined : boxes.find(candidate => candidate.id === comment.elementId);
        if (box !== undefined) placed.push({ comment, x: box.x + box.width - pinInset, y: box.y + pinInset, anchored: true });
        else if (comment.position !== undefined) placed.push({ comment, x: comment.position.x, y: comment.position.y, anchored: false });
        else unplaced.push(comment);
    }
    return { placed, unplaced };
}

/** The open comments of a screen, by the element they are about - what the AI is told. Comments about no element are under the empty key. */
export function commentsByElement(comments: readonly DesignComment[], screen: string): Map<string, DesignComment[]> {
    const grouped = new Map<string, DesignComment[]>();
    for (const comment of comments.filter(candidate => candidate.screen === screen && !candidate.resolved)) {
        const key = comment.elementId ?? '';
        grouped.set(key, [...(grouped.get(key) ?? []), comment]);
    }
    return grouped;
}

/** The events of a new comment: it is added with its element, and pinned to a position when no element is under the pin. */
export function commentEvents(screen: string, anchor: PinAnchor, text: string, author: string, ids: DesignIds): DesignSessionEvent[] {
    const commentId = ids.next('comment');
    const added: DesignSessionEvent = { type: 'CommentAdded', commentId, screen, text, author, ...('elementId' in anchor ? { elementId: anchor.elementId } : {}) };
    return 'position' in anchor ? [added, { type: 'CommentPinned', commentId, x: anchor.position.x, y: anchor.position.y }] : [added];
}
