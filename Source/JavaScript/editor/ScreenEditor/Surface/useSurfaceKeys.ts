// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { KeyboardEvent, RefObject } from 'react';
import { isDeleteKey } from '../Structure/isDeleteKey';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ShellState } from '../ShellFrame/useShellFrame';
import { handleDesignModeKey } from '../DesignMode/designModeKeys';
import type { useDesignMode } from '../DesignMode/useDesignMode';

// The surface takes focus when it is clicked so the keys reach it, and keys pressed
// in a control of a component drawn on it stay with that control.
export const useSurfaceKeys = (surface: RefObject<HTMLDivElement | null>, controller: ScreenEditorController, designMode: ReturnType<typeof useDesignMode>, shell: ShellState | undefined) => (event: KeyboardEvent) => {
    // Escape while a destination is peeked at goes back to the screen (spec N7).
    if (event.key === 'Escape' && shell?.peeking) { event.preventDefault(); shell.back(); return; }
    // The keys of a selected design-mode item come first: Esc, Enter, Alt with the arrows, and Delete of the item (DM7).
    if (handleDesignModeKey(event, designMode, () => {
        const title = surface.current?.querySelector<HTMLInputElement>('.studio-design-toolbar__title');
        title?.focus({ preventScroll: true });
        return !!title;
    })) return;
    if (!isDeleteKey(event) || !controller.selectedId || !controller.canRemove(controller.selectedId)) return;
    event.preventDefault();
    controller.remove(controller.selectedId);
};
