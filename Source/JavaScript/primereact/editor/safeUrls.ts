// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Schemes a link may use. Anything else, `javascript:` and `data:` above all, is dropped. */
const linkProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** The only images that are kept: small raster data URLs. A remote image is a request made just by rendering. */
const rasterDataUrl = /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/]+={0,2}$/i;

/** Resolved against, to learn which scheme a browser would act on. It is never sent to. */
const placeholderOrigin = 'https://editor.invalid';

/**
 * Returns a link target a browser may follow, or `undefined`.
 *
 * Browsers strip tabs and newlines from inside a scheme, so the address is judged by what `URL` resolves it to
 * and not by its text: `java\tscript:` is a `javascript:` link. Relative links and fragments resolve against
 * an http origin and are kept.
 *
 * @param value The authored `href`.
 */
export function safeLinkUrl(value: string): string | undefined {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    try {
        return linkProtocols.has(new URL(trimmed, placeholderOrigin).protocol) ? trimmed : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Returns an image source that may be rendered, or `undefined`.
 *
 * Only base64 PNG, JPEG, GIF and WebP data URLs pass. SVG is refused because it can carry script, and an
 * `http(s)` image is refused because rendering it would contact a server the author named.
 *
 * @param value The authored `src`.
 */
export function safeImageUrl(value: string): string | undefined {
    const trimmed = value.trim();
    return rasterDataUrl.test(trimmed) ? trimmed : undefined;
}
