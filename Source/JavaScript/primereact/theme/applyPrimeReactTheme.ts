// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactThemeStylesheet, themeLinkElementId } from './primeReactThemeStylesheet';

/**
 * Swaps the loaded PrimeReact theme stylesheet, live, with no reload and no remount.
 *
 * This follows the mechanism PrimeReact 10.9.8 implements in `PrimeReactContext.changeTheme` (see
 * `node_modules/primereact/api/api.js`), because a PrimeReact 10 theme is a pre-compiled CSS file rather
 * than a set of runtime variables - there is nothing to set, only a different file to load. What
 * `changeTheme` does is find the `<link>` by id, build a new URL, create a *replacement* `<link>` element
 * and swap it into the same position. Creating a new element rather than assigning to `href` is the part
 * that matters: some browsers do not reliably re-fetch a stylesheet whose `href` is mutated in place.
 *
 * Two things are done differently, both deliberately:
 *
 * - PrimeReact string-replaces the old theme name anywhere in the URL. That breaks as soon as a theme
 *   name also appears elsewhere in the path (an application served from `/nano/`, say, switching away
 *   from the `nano` theme). This replaces the theme *folder segment* instead, which is unambiguous.
 * - PrimeReact throws when the `<link>` is missing. Here a missing link is created, because a Scene host
 *   embedding a preview has no reason to have pre-declared one, and refusing to theme a page for want of
 *   an element we can add ourselves is not a useful failure.
 *
 * The application keeps ownership of *where* themes are served from: when the link already exists, only
 * its theme folder is rewritten and the rest of the URL is left exactly as the host wrote it.
 *
 * @param themeName The theme to load, as named in `primeReactThemes`.
 * @param linkElementId The id of the stylesheet `<link>`, matching PrimeReact's own `changeTheme` argument.
 * @returns `true` when the stylesheet was swapped, `false` when the theme is unknown or there is no document.
 */
export function applyPrimeReactTheme(themeName: string, linkElementId: string = themeLinkElementId): boolean {
    const stylesheet = primeReactThemeStylesheet(themeName);
    if (stylesheet === undefined || typeof document === 'undefined') return false;

    const existing = document.getElementById(linkElementId);
    const href = existing?.getAttribute('href');
    const nextHref = href === undefined || href === null ? stylesheet : href.replace(/[^/]+\/theme\.css(\?.*)?$/, `${themeName}/theme.css$1`);

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('id', linkElementId);
    link.setAttribute('href', nextHref);

    if (existing?.parentNode) {
        existing.parentNode.replaceChild(link, existing);
    } else {
        document.head.appendChild(link);
    }

    return true;
}
