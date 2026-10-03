// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SafeElement } from './SafeElement';
import { SafeNode } from './SafeNode';
import { safeImageUrl, safeLinkUrl } from './safeUrls';

/** Elements that are kept. Every other element is unwrapped: its children stay, the element does not. */
const keptTags = new Set([
    'p', 'div', 'span', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'sub', 'sup', 'code', 'pre', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img',
]);

/** Elements whose content is never text to show - script, style, embedded documents and form controls. */
const discardedWithContent = new Set([
    'script', 'style', 'template', 'noscript', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'svg', 'math',
    'audio', 'video', 'canvas', 'textarea', 'select', 'option', 'button', 'input', 'form', 'head', 'title', 'meta', 'link', 'base',
]);

/** Quill's own formatting classes. They name CSS rules, so a fixed vocabulary is safe and anything else is not kept. */
const formattingClass = /^ql-(align-(center|right|justify)|indent-[1-8]|size-(small|large|huge)|font-(serif|monospace)|direction-rtl)$/;

const listKinds = new Set(['bullet', 'ordered', 'checked', 'unchecked']);

/** Deeper than any real document nests. Anything below is flattened to its text. */
const maximumDepth = 64;

/**
 * Reduces authored HTML to the part that is safe to render.
 *
 * It parses with `DOMParser`, which builds an inert document: nothing in it loads, runs or paints while it is
 * walked. The walk then keeps only elements from an allowlist and, on those, only the attributes listed
 * here - a validated `href` or image `src`, Quill's formatting classes and list kind. Event handlers,
 * `style`, `srcdoc`, unknown elements' attributes and every URL that is not allowed are dropped, and script,
 * style, SVG, frames and form controls are removed together with their content.
 *
 * The result is plain data. Render it with `renderSafeNodes` or serialize it with `serializeSafeNodes`; the
 * authored string itself is never put into the document.
 *
 * @param html The authored HTML.
 * @returns The safe nodes.
 * @throws When there is no `DOMParser`. Use `htmlToPlainText` where there is no DOM.
 */
export function sanitizeHtml(html: string): SafeNode[] {
    if (typeof DOMParser === 'undefined') throw new Error('Sanitizing HTML needs a DOM. Use htmlToPlainText where there is none.');
    return sanitizeChildren(new DOMParser().parseFromString(html, 'text/html').body, 0);
}

function sanitizeChildren(parent: Node, depth: number): SafeNode[] {
    const nodes: SafeNode[] = [];
    for (const child of Array.from(parent.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
            if (child.textContent !== null && child.textContent !== '') nodes.push(child.textContent);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            nodes.push(...sanitizeElement(child as Element, depth));
        }
    }
    return nodes;
}

function sanitizeElement(element: Element, depth: number): SafeNode[] {
    const tag = element.tagName.toLowerCase();
    if (discardedWithContent.has(tag)) return [];
    if (depth >= maximumDepth) return [element.textContent ?? ''];

    const children = sanitizeChildren(element, depth + 1);
    if (!keptTags.has(tag)) return children;

    const attributes = keptAttributes(tag, element);
    if (tag === 'img' && attributes.src === undefined) return [];
    if (tag === 'a' && attributes.href === undefined) return children;
    return [{ tag, attributes, children } satisfies SafeElement];
}

function keptAttributes(tag: string, element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};

    const href = tag === 'a' ? safeLinkUrl(element.getAttribute('href') ?? '') : undefined;
    if (href !== undefined) attributes.href = href;

    const source = tag === 'img' ? safeImageUrl(element.getAttribute('src') ?? '') : undefined;
    if (source !== undefined) {
        attributes.src = source;
        attributes.alt = element.getAttribute('alt') ?? '';
    }

    const classes = (element.getAttribute('class') ?? '').split(/\s+/).filter(name => formattingClass.test(name));
    if (classes.length > 0) attributes.class = classes.join(' ');

    const listKind = element.getAttribute('data-list');
    if (tag === 'li' && listKind !== null && listKinds.has(listKind)) attributes['data-list'] = listKind;

    return attributes;
}
