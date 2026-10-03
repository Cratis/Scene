// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TreeNode } from '../TreeNode';
import { TreeTableCheckState } from './TreeTableCheckState';

/** The outcome of settling a checkbox selection: the keys that are checked, and how each row reads. */
export interface SettledSelection {
    checked: Set<string>;
    states: Map<string, TreeTableCheckState>;
}

const selectable = (node: TreeNode) => node.selectable !== false;

/**
 * Settles a checkbox selection against the tree, the way a checkbox tree reads:
 * - a checked parent has all of its selectable descendants checked;
 * - a parent is checked when all of its selectable children are, partially checked when some are, and
 *   unchecked otherwise;
 * - a node that is not selectable, and has nothing selectable below it, takes no part.
 *
 * Applying this to what the user toggled, or to an authored selection, is what keeps both consistent.
 *
 * @param nodes The root nodes.
 * @param requested The keys asked for.
 */
export function settleSelection(nodes: TreeNode[], requested: ReadonlySet<string>): SettledSelection {
    const cascaded = new Set<string>();
    const cascade = (node: TreeNode, inherited: boolean) => {
        const on = inherited || requested.has(node.key ?? '');
        if (on) cascaded.add(node.key ?? '');
        node.children?.forEach(child => cascade(child, on));
    };
    nodes.forEach(node => cascade(node, false));

    const checked = new Set<string>();
    const states = new Map<string, TreeTableCheckState>();
    const settle = (node: TreeNode): TreeTableCheckState | undefined => {
        const key = node.key ?? '';
        const childStates = (node.children ?? []).map(settle).filter((state): state is TreeTableCheckState => state !== undefined);
        let state: TreeTableCheckState | undefined;
        if (childStates.length === 0) {
            state = selectable(node) ? (cascaded.has(key) ? TreeTableCheckState.Checked : TreeTableCheckState.Unchecked) : undefined;
        } else if (childStates.every(child => child === TreeTableCheckState.Checked)) {
            state = TreeTableCheckState.Checked;
        } else {
            state = childStates.some(child => child !== TreeTableCheckState.Unchecked) ? TreeTableCheckState.Partial : TreeTableCheckState.Unchecked;
        }

        if (state !== undefined) states.set(key, state);
        if (state === TreeTableCheckState.Checked) checked.add(key);
        return state;
    };
    nodes.forEach(settle);

    return { checked, states };
}

/**
 * Toggles one row's checkbox: a checked row unchecks its whole subtree, any other row checks it.
 *
 * @param nodes The root nodes.
 * @param settled The current settled selection.
 * @param node The row's node.
 * @returns The keys to settle again.
 */
export function toggleCheckbox(nodes: TreeNode[], settled: SettledSelection, node: TreeNode): Set<string> {
    const subtree: string[] = [];
    const collect = (current: TreeNode) => {
        subtree.push(current.key ?? '');
        current.children?.forEach(collect);
    };
    collect(node);

    const next = new Set(settled.checked);
    const checking = settled.states.get(node.key ?? '') !== TreeTableCheckState.Checked;
    subtree.forEach(key => { if (checking) next.add(key); else next.delete(key); });

    // A checked ancestor would check the unchecked subtree again, so unchecking also unchecks the ancestors.
    if (!checking) (ancestorKeys(nodes, node.key ?? '') ?? []).forEach(key => next.delete(key));
    return settleSelection(nodes, next).checked;
}

function ancestorKeys(nodes: TreeNode[], key: string, path: string[] = []): string[] | undefined {
    for (const node of nodes) {
        if (node.key === key) return path;
        const found = ancestorKeys(node.children ?? [], key, [...path, node.key ?? '']);
        if (found !== undefined) return found;
    }

    return undefined;
}
