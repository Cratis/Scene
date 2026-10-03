// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SafeNode } from './SafeNode';

const voidTags = new Set(['br', 'hr', 'img']);

const escapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

const escape = (text: string) => text.replace(/[&<>"]/g, character => escapes[character]);

/**
 * Writes safe nodes back out as an HTML string, for an editor that reads HTML.
 *
 * Text and attribute values are escaped, and only tags and attributes the allowlist produced are written, so
 * the string can contain nothing the allowlist did not already accept.
 *
 * @param nodes The nodes `sanitizeHtml` returned.
 */
export function serializeSafeNodes(nodes: SafeNode[]): string {
    return nodes.map(node => {
        if (typeof node === 'string') return escape(node);
        const attributes = Object.entries(node.attributes).map(([name, value]) => ` ${name}="${escape(value)}"`).join('');
        return voidTags.has(node.tag) ? `<${node.tag}${attributes}>` : `<${node.tag}${attributes}>${serializeSafeNodes(node.children)}</${node.tag}>`;
    }).join('');
}
