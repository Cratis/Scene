// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useLayoutConfig } from '../configuration';

/**
 * The scrim behind a floating sidebar.
 *
 * It is a `button` rather than a `div` because its only job is to close the sidebar, and a click target
 * that is not focusable or reachable from the keyboard traps anyone not using a mouse behind an open
 * overlay with no way out. It renders nothing at all when no sidebar is floating, so it never sits
 * invisibly over the page swallowing clicks.
 */
export function LayoutMask() {
    const { isMaskVisible, setSidebarOpen } = useLayoutConfig();
    if (!isMaskVisible) {
        return undefined;
    }

    return <button type='button' className='layout-mask' aria-label='Close the menu' onClick={() => setSidebarOpen(false)} />;
}

/**
 * The `mask` component, for a template that wants to place the scrim itself rather than let
 * {@link AppShell} do it.
 */
export function Mask() {
    return <LayoutMask />;
}
