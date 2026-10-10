// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Whether loading an asset reaches beyond the host: an absolute URL with any scheme other than `data:`
 * or `blob:` (`https://`, `http://`, `ws://`, `ftp://`), or a protocol-relative `//host/...` reference. A
 * package-relative path or a bare module specifier such as `@cratis/components/styles` is resolved by the
 * host from what it bundled, so it is not a network asset.
 */
export function isNetworkAsset(asset: string): boolean {
    const trimmed = asset.trim();
    if (trimmed.startsWith('//')) return true;
    const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed)?.[1]?.toLowerCase();
    return scheme !== undefined && scheme !== 'data' && scheme !== 'blob';
}
