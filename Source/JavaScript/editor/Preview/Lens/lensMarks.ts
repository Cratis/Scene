// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { LensStrings } from './LensStrings';

// What the lens needs of a node of the rendered preview. The browser's elements are such nodes; a spec can say it with plain objects.
export interface LensNode {
    getAttribute(name: string): string | null;
}

export interface LensRoot<TNode extends LensNode = LensNode> {
    querySelectorAll(selector: string): ArrayLike<TNode>;
}

export enum LensMarkKind {
    Hook = 'hook',
    UnlinkedHook = 'unlinkedHook',
    Query = 'query',
    Filter = 'filter',
    UnboundText = 'unboundText',
}

// What the lens says about one node: a short label, and - for a hook that cannot be used - the reason, which is Scene's own.
export interface LensMark<TNode extends LensNode = LensNode> {
    kind: LensMarkKind;
    node: TNode;
    label: string;
    blocked: boolean;
    reason?: string;
}

// Everything the lens reads is something the rendered preview already says about itself: Scene marks a hook with the slice it runs, where it opens and
// whether it is enabled, and the reason it is not; a filter with the parameter it sets; Studio's data components with the query they show. The lens adds no
// reading of the model of its own.
export const lensSelector = '[data-scene-slice], [data-scene-warning], [data-preview-query], [data-scene-query-parameter], [data-scene-id]';

const lastSegment = (name: string): string => name.slice(name.lastIndexOf('.') + 1);

const present = (value: string | null): string | undefined => value !== null && value !== '' ? value : undefined;

function markOf<TNode extends LensNode>(node: TNode, unbound: ReadonlySet<string>, words: LensStrings): LensMark<TNode> | undefined {
    const slice = present(node.getAttribute('data-scene-slice'));
    if (slice !== undefined) {
        const opens = present(node.getAttribute('data-scene-opens'));
        const state = node.getAttribute('data-scene-enablement');
        const blocked = state === 'disabled';
        const reason = present(node.getAttribute('title')) ?? present(node.getAttribute('aria-description'));
        return {
            kind: LensMarkKind.Hook,
            node,
            label: opens === undefined ? lastSegment(slice) : words.hook.replace('{slice}', lastSegment(slice)).replace('{opens}', opens),
            blocked,
            ...(blocked && reason !== undefined ? { reason } : {}),
        };
    }

    if (node.getAttribute('data-scene-warning') !== null) return { kind: LensMarkKind.UnlinkedHook, node, label: words.unlinkedHook, blocked: false };

    const parameter = present(node.getAttribute('data-scene-query-parameter'));
    if (parameter !== undefined) {
        const query = present(node.getAttribute('data-scene-query'));
        return { kind: LensMarkKind.Filter, node, label: words.filter.replace('{target}', query === undefined ? parameter : `${query}.${parameter}`), blocked: false };
    }

    const shown = present(node.getAttribute('data-preview-query'));
    if (shown !== undefined) return { kind: LensMarkKind.Query, node, label: words.query.replace('{query}', shown), blocked: false };

    const id = present(node.getAttribute('data-scene-id'));
    if (id !== undefined && unbound.has(id)) return { kind: LensMarkKind.UnboundText, node, label: words.unboundText, blocked: false };
    return undefined;
}

// The marks of what is drawn: one per node that is a hook, a data component, a filter or text bound to nothing, in document order.
export function describeLensMarks<TNode extends LensNode>(root: LensRoot<TNode>, unbound: ReadonlySet<string>, words: LensStrings): LensMark<TNode>[] {
    const marks: LensMark<TNode>[] = [];
    const nodes = root.querySelectorAll(lensSelector);
    for (let index = 0; index < nodes.length; index++) {
        const mark = markOf(nodes[index], unbound, words);
        if (mark) marks.push(mark);
    }

    return marks;
}
