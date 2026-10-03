// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Elements dropped together with their content, as `sanitizeHtml` does. */
const discardedWithContent = new Set(['script', 'style', 'template', 'noscript', 'iframe', 'object', 'embed', 'svg', 'math', 'textarea', 'title', 'head']);

/** Elements after which a line break reads naturally. */
const breaking = new Set(['p', 'div', 'br', 'hr', 'li', 'tr', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const namedEntities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/**
 * Reads authored HTML as plain text, without a DOM.
 *
 * This is what server rendering shows, where there is no `DOMParser` to build safe markup with. The result
 * is only ever rendered as text, which React escapes, so it cannot carry markup however the input is built.
 * It scans once, left to right: tags are dropped, script, style and similar elements go with their content,
 * and block elements become line breaks.
 *
 * @param html The authored HTML.
 * @returns The text, with line breaks between blocks.
 */
export function htmlToPlainText(html: string): string {
    const lower = html.toLowerCase();
    let text = '';
    let position = 0;
    while (position < html.length) {
        const open = html.indexOf('<', position);
        if (open === -1) {
            text += html.slice(position);
            break;
        }

        text += html.slice(position, open);
        if (!/[a-z/!?]/i.test(html[open + 1] ?? '')) {
            text += '<';
            position = open + 1;
            continue;
        }

        if (lower.startsWith('<!--', open)) {
            const close = html.indexOf('-->', open + 4);
            position = close === -1 ? html.length : close + 3;
            continue;
        }

        const close = html.indexOf('>', open);
        if (close === -1) {
            text += html.slice(open);
            break;
        }

        const name = /^<\/?([a-z][a-z0-9]*)/.exec(lower.slice(open, close + 1))?.[1];
        position = close + 1;
        if (name === undefined) continue;
        if (lower[open + 1] !== '/' && discardedWithContent.has(name)) {
            const end = lower.indexOf(`</${name}`, position);
            const endClose = end === -1 ? -1 : html.indexOf('>', end);
            position = endClose === -1 ? html.length : endClose + 1;
        } else if (breaking.has(name) && (lower[open + 1] === '/' || name === 'br' || name === 'hr')) {
            text += '\n';
        }
    }

    return decodeEntities(text).replace(/\n{3,}/g, '\n\n').trim();
}

function decodeEntities(text: string): string {
    return text.replace(/&(#x[0-9a-f]{1,6}|#[0-9]{1,7}|[a-z]+);/gi, (match, entity: string) => {
        if (entity[0] !== '#') return namedEntities[entity.toLowerCase()] ?? match;
        const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
    });
}
