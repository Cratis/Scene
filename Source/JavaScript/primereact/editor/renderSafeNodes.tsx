// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, ReactNode } from 'react';
import { SafeNode } from './SafeNode';

const voidTags = new Set(['br', 'hr', 'img']);

/**
 * Renders safe nodes as React elements.
 *
 * Nothing is ever injected as markup: each node becomes an element created from the allowlisted tag name with
 * the validated attributes, and text goes through React's escaping. Links are made `noopener noreferrer` and
 * open in the same context.
 *
 * @param nodes The nodes `sanitizeHtml` returned.
 */
export function renderSafeNodes(nodes: SafeNode[]): ReactNode[] {
    return nodes.map((node, index) => {
        if (typeof node === 'string') return node;
        const { class: className, ...attributes } = node.attributes;
        const properties: Record<string, string | undefined> = { key: String(index), className, ...attributes };
        if (node.tag === 'a') properties.rel = 'noopener noreferrer';
        return createElement(node.tag, properties, ...(voidTags.has(node.tag) ? [] : renderSafeNodes(node.children)));
    });
}
