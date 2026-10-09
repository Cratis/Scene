// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Finds cycles in a "renders inside" graph, where an edge from a screen to another means the first is
 * placed in an outlet the second one's template owns. Screens are visited in the given order and edges in
 * insertion order, so the same graph always yields the same cycles in the same order. Each set of screens
 * is reported once, starting from the screen the walk reached it through.
 */
export function findHostingCycles(screens: string[], edges: Map<string, string[]>): string[][] {
    const state = new Map<string, 'visiting' | 'done'>();
    const stack: string[] = [];
    const reported = new Set<string>();
    const cycles: string[][] = [];

    const visit = (screen: string) => {
        state.set(screen, 'visiting');
        stack.push(screen);
        for (const host of edges.get(screen) ?? []) {
            const hostState = state.get(host);
            if (hostState === 'visiting') {
                const cycle = stack.slice(stack.indexOf(host));
                const key = [...cycle].sort().join('\u0000');
                if (!reported.has(key)) {
                    reported.add(key);
                    cycles.push(cycle);
                }
            } else if (hostState === undefined) {
                visit(host);
            }
        }
        stack.pop();
        state.set(screen, 'done');
    };

    for (const screen of screens) {
        if (!state.has(screen)) visit(screen);
    }

    return cycles;
}
