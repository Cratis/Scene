// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UploadTarget } from './UploadTarget';

/** A scheme (`https:`) or a protocol-relative prefix (`//host`): the address names its own host. */
const namesItsOwnHost = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

/** Whitespace, control characters and backslashes, which browsers normalize in ways that disguise another host. */
const disguisesAHost = (address: string) => Array.from(address).some(character => character <= ' ' || character === '\u007f' || character === '\\');

/** Resolved against, to read an address's own parts without depending on a page. It is never sent to. */
const placeholderOrigin = 'https://upload-target.invalid';

/**
 * Checks the address an authored upload sends files to.
 *
 * The address comes from authored model data, so it is not trusted. By default an upload may only go to the
 * origin the page was served from - a relative address, or an absolute one with the same origin. A host that
 * needs another origin names it in `allowedOrigins` when it provides the upload handler. Whatever is accepted
 * has the scheme `http:` or `https:`, carries no user information, and contains no whitespace, control
 * characters or backslashes, because those are how an address is made to point somewhere other than where it
 * reads.
 *
 * @param url The authored address, if any.
 * @param pageOrigin The origin of the page, `undefined` where there is no page (server rendering).
 * @param allowedOrigins The additional origins the host permits.
 * @returns The address to send to, or why it cannot be used.
 */
export function resolveUploadTarget(url: string | undefined, pageOrigin: string | undefined, allowedOrigins: readonly string[]): UploadTarget {
    if (url === undefined || url === '') return { isValid: true, url: undefined };
    if (disguisesAHost(url)) return refused('it contains whitespace, control characters or a backslash');

    let resolved: URL;
    try {
        resolved = new URL(url, placeholderOrigin);
    } catch {
        return refused('it is not a valid address');
    }

    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return refused(`the ${resolved.protocol} scheme is not allowed`);
    if (resolved.username !== '' || resolved.password !== '') return refused('it carries user information');
    if (!namesItsOwnHost.test(url)) return { isValid: true, url };

    const permitted = [...(pageOrigin === undefined ? [] : [pageOrigin]), ...allowedOrigins.flatMap(originOf)];
    return permitted.includes(resolved.origin)
        ? { isValid: true, url: resolved.href }
        : refused(`${resolved.origin} is not the origin of this page or one the host allows`);
}

function originOf(address: string): string[] {
    try {
        return [new URL(address).origin];
    } catch {
        return [];
    }
}

function refused(reason: string): UploadTarget {
    return { isValid: false, message: `The upload address is not allowed: ${reason}.` };
}
