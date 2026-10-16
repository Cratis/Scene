// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { descendantCount, expandedToDepth, OrgTreeNode, buildOrgTree, placements, readOrgNodes, visibleNodes } from './orgModel';
import { FoundationFrame } from './StateFrame';
import { useUrlState } from './urlState';

/**
 * The `orgTree` component: an organization as an expandable tree of people and units.
 *
 * `nodes` are flat rows - `id`, `label`, `title`, `parentId` - as a query returns them; the tree is built from them, so someone whose manager is
 * missing becomes a root and a reporting cycle is cut instead of looping. It follows the ARIA tree pattern: one tab stop, Up and Down move,
 * Right expands or enters, Left collapses or goes to the parent, Home and End jump, Enter or Space selects. Each item says how many reports it
 * has in words. The selected id is published as the `value` output; `expandedDepth` is how many levels are open at first. With `urlKey` the selection is kept in the address
 * under that parameter, so it survives a refresh and a component reading the same parameter - a list narrowing to the chosen branch - follows it.
 */
export function OrgTree({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const nodes = useMemo(() => readOrgNodes(element.properties.nodes), [element.properties.nodes]);
    const roots = useMemo(() => buildOrgTree(nodes), [nodes]);
    const depth = typeof element.properties.expandedDepth === 'number' ? element.properties.expandedDepth : 2;
    const initial = useMemo(() => expandedToDepth(roots, depth), [roots, depth]);
    const [expanded, setExpanded] = useState<Set<string>>(initial);
    const [selected, setSelected] = useUrlState(typeof element.properties.urlKey === 'string' && element.properties.urlKey.length > 0 ? element.properties.urlKey : undefined, typeof element.properties.selected === 'string' ? element.properties.selected : undefined);
    const [focused, setFocused] = useState<string | undefined>(undefined);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, nodes.length > 0);
    const visible = visibleNodes(roots, expanded);
    const placed = useMemo(() => placements(roots), [roots]);
    const tabStop = visible.find(node => node.id === focused)?.id ?? visible.find(node => node.id === selected)?.id ?? visible[0]?.id;
    const emptyElement = state === ComponentState.Empty ? { ...element, properties: { emptyHeadline: strings.orgNone, ...element.properties } } : element;

    useEffect(() => setExpanded(initial), [initial]);
    useValueOutput(bindingOutputs, selected);

    const move = (node: OrgTreeNode, event: KeyboardEvent) => {
        const index = visible.indexOf(node);
        const focus = (target: OrgTreeNode | undefined) => {
            if (!target) return;
            event.preventDefault();
            setFocused(target.id);
            requestAnimationFrame(() => document.getElementById(`${element.id}-${target.id}`)?.focus());
        };
        const toggle = (open: boolean) => setExpanded(current => { const next = new Set(current); if (open) next.add(node.id); else next.delete(node.id); return next; });
        const parent = placed.get(node.id)?.parent;

        switch (event.key) {
            case 'ArrowDown': focus(visible[index + 1]); break;
            case 'ArrowUp': focus(visible[index - 1]); break;
            case 'Home': focus(visible[0]); break;
            case 'End': focus(visible[visible.length - 1]); break;
            case 'ArrowRight':
                if (node.children.length > 0 && !expanded.has(node.id)) { event.preventDefault(); toggle(true); } else focus(node.children[0]);
                break;
            case 'ArrowLeft':
                if (node.children.length > 0 && expanded.has(node.id)) { event.preventDefault(); toggle(false); } else focus(parent);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                setSelected(node.id);
                interactions?.onSelect?.();
                break;
            default: break;
        }
    };

    return (
        <FoundationFrame element={emptyElement} interactions={interactions} name='org-tree' state={state} skeleton={[50, 70, 70, 60]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <ul role='tree' aria-label={strings.orgTree} className='foundation-tree'>
                    {visible.map(node => {
                        const siblings = placed.get(node.id)?.siblings ?? [node];
                        const reports = descendantCount(node);
                        const open = expanded.has(node.id);
                        return (
                            <li key={node.id} id={`${element.id}-${node.id}`} role='treeitem' tabIndex={node.id === tabStop ? 0 : -1} aria-level={node.depth}
                                aria-setsize={siblings.length} aria-posinset={siblings.findIndex(sibling => sibling.id === node.id) + 1} aria-expanded={node.children.length > 0 ? open : undefined} aria-selected={node.id === selected}
                                className='foundation-tree-item' data-selected={node.id === selected} style={{ paddingInlineStart: `calc(var(--foundation-space-4) * ${node.depth - 1})` }}
                                onKeyDown={event => move(node, event)} onFocus={() => setFocused(node.id)} onClick={() => { setSelected(node.id); interactions?.onSelect?.(); }}>
                                {node.children.length > 0 ? (
                                    <button type='button' tabIndex={-1} className='foundation-icon-button' aria-hidden='true'
                                        onClick={event => { event.stopPropagation(); setExpanded(current => { const next = new Set(current); if (open) next.delete(node.id); else next.add(node.id); return next; }); }}>
                                        <FoundationIcon name={open ? 'chevron-down' : 'chevron-right'} />
                                    </button>
                                ) : <span className='foundation-tree-spacer' />}
                                <span className='foundation-tree-text'>
                                    <strong>{node.label}</strong>
                                    {node.title && <span className='foundation-count'>{node.title}</span>}
                                </span>
                                {reports > 0 && <span className='foundation-count'>{formatText(strings.orgReports, { count: reports })}</span>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </FoundationFrame>
    );
}
