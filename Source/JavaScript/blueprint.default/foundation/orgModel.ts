// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A person or unit in an organization, with who they report to. */
export interface OrgNode {
    id: string;
    label: string;
    title?: string;
    parentId?: string;
}

/** A node placed in the tree. */
export interface OrgTreeNode extends OrgNode {
    children: OrgTreeNode[];
    depth: number;
}

/** Reads nodes out of a property value, dropping entries without an id and keeping the first of a repeated id. */
export function readOrgNodes(value: unknown): OrgNode[] {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    return value.flatMap((entry): OrgNode[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { id, label, title, parentId } = entry as Record<string, unknown>;
        if (typeof id !== 'string' || id.length === 0 || seen.has(id)) return [];
        seen.add(id);
        return [{ id, label: typeof label === 'string' && label.length > 0 ? label : id, ...(typeof title === 'string' ? { title } : {}), ...(typeof parentId === 'string' && parentId.length > 0 ? { parentId } : {}) }];
    });
}

/**
 * Builds the tree from the flat rows a query returns.
 *
 * Someone whose manager is not in the data becomes a root rather than vanishing, and a reporting cycle is broken at the node that closes it
 * - which becomes a root - so malformed data draws something and never loops. Siblings keep the order of the rows.
 */
export function buildOrgTree(nodes: OrgNode[]): OrgTreeNode[] {
    const known = new Set(nodes.map(node => node.id));
    const parentOf = new Map<string, string | undefined>(nodes.map(node => [node.id, node.parentId !== undefined && known.has(node.parentId) && node.parentId !== node.id ? node.parentId : undefined]));

    for (const node of nodes) {
        const path = new Set<string>([node.id]);
        for (let current = parentOf.get(node.id); current !== undefined; current = parentOf.get(current)) {
            if (path.has(current)) { parentOf.set(node.id, undefined); break; }
            path.add(current);
        }
    }

    const placed = new Map<string, OrgTreeNode>(nodes.map(node => [node.id, { ...node, children: [], depth: 0 }]));
    const roots: OrgTreeNode[] = [];
    for (const node of nodes) {
        const parent = parentOf.get(node.id);
        if (parent === undefined) roots.push(placed.get(node.id)!);
        else placed.get(parent)!.children.push(placed.get(node.id)!);
    }

    const assignDepth = (level: OrgTreeNode[], depth: number) => level.forEach(node => { node.depth = depth; assignDepth(node.children, depth + 1); });
    assignDepth(roots, 1);
    return roots;
}

/** The nodes that can be reached from the roots with the given expansion, in the order they are drawn. */
export function visibleNodes(roots: OrgTreeNode[], expanded: ReadonlySet<string>): OrgTreeNode[] {
    return roots.flatMap(node => [node, ...(expanded.has(node.id) ? visibleNodes(node.children, expanded) : [])]);
}

/** The ids of every node down to a depth: what is expanded when the tree first opens. */
export function expandedToDepth(roots: OrgTreeNode[], depth: number): Set<string> {
    const result = new Set<string>();
    const walk = (level: OrgTreeNode[]) => level.forEach(node => { if (node.depth < depth && node.children.length > 0) result.add(node.id); walk(node.children); });
    walk(roots);
    return result;
}

/** The number of people below a node, at any depth. */
export const descendantCount = (node: OrgTreeNode): number => node.children.reduce((sum, child) => sum + 1 + descendantCount(child), 0);

/** For each node, the nodes that share its parent (itself included, in order) and its parent: what a tree needs for its set size and position, and for Left to go up. */
export function placements(roots: OrgTreeNode[]): Map<string, { siblings: OrgTreeNode[]; parent?: OrgTreeNode }> {
    const result = new Map<string, { siblings: OrgTreeNode[]; parent?: OrgTreeNode }>();
    const walk = (level: OrgTreeNode[], parent?: OrgTreeNode) => level.forEach(node => { result.set(node.id, { siblings: level, parent }); walk(node.children, node); });
    walk(roots);
    return result;
}
