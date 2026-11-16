// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SyntheticEvent } from 'react';

// A menu is portaled to the document body, but React still bubbles its events up the tree it was rendered from - and
// that tree is the board or the property panel, which would pick a press up as a drag, a click or a shortcut. Only
// React's own bubbling is ended here; the native event carries on to the document, where closing on an outside press needs it.
const keepInput = (event: SyntheticEvent): void => {
    event.isPropagationStopped = () => true;
};

/** Every way a user reaches into a menu. Spread it on the menu's outermost element, inside the portal. */
export const menuInputBoundary = {
    onPointerDown: keepInput,
    onPointerUp: keepInput,
    onMouseDown: keepInput,
    onMouseUp: keepInput,
    onClick: keepInput,
    onDoubleClick: keepInput,
    onContextMenu: keepInput,
    onWheel: keepInput,
    onKeyUp: keepInput,
    onDragStart: keepInput,
} as const;

/** Ends React's bubbling of a key press, for the one handler that needs to see it first. */
export const keepKeyInMenu = keepInput;
