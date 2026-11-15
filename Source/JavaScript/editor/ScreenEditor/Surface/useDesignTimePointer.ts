// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, type RefObject } from 'react';
import { isTypingTarget } from '../Structure/isDeleteKey';
import { decideShellPointer, ShellPointer } from '../ShellFrame/decideShellPointer';
import { decideDesignTimePointer, designTimePointerEvents, elementIdAt, itemIdAt } from './designTimePointer';

// Gives the surface the first word on every press inside the screen, in the capture phase, before the component that was pressed has heard
// it: a click anywhere on a component - however many inner controls it is made of, and whatever they do with the event - selects that
// component, and the screen is not played while it is designed. Play never mounts this. The editor's own marks (the grip, the outline)
// sit outside the rendered screen and are left alone.
//
// A press on an item of a component - a navigation item, which is not an element of its own - also says which item, so the item can be selected inside
// its component (design mode).
export function useDesignTimePointer(surface: RefObject<HTMLElement | null>, select: (id: string | undefined, itemId?: string) => void, shellShown = false) {
    const latest = useRef(select);
    latest.current = select;
    const shell = useRef(shellShown);
    shell.current = shellShown;

    useEffect(() => {
        const node = surface.current;
        if (!node) return;

        const meet = (event: Event) => {
            const target = event.target as Element | null;
            // The editor's own marks are not part of the screen.
            if (target?.closest?.('.studio-screen-surface__chrome')) return;
            // The shell around the screen is context: its navigation entries are Scene's to handle, the rest of it does nothing.
            const onShell = decideShellPointer(target, shell.current);
            if (onShell === ShellPointer.Navigate) return;
            if (onShell === ShellPointer.Ignore) {
                if (event.type === 'click') event.preventDefault();
                event.stopPropagation();
                return;
            }
            const decision = decideDesignTimePointer(event.type, target, (event as MouseEvent).button);
            if (decision.select) {
                if (!isTypingTarget(target)) node.focus({ preventScroll: true });
                const pointer = event as MouseEvent;
                latest.current(elementIdAt(target), itemIdAt(target, typeof pointer.clientX === 'number' ? { x: pointer.clientX, y: pointer.clientY } : undefined));
            }
            if (decision.cancelDefault) event.preventDefault();
            if (decision.swallow) event.stopPropagation();
        };

        for (const type of designTimePointerEvents) node.addEventListener(type, meet, true);
        return () => { for (const type of designTimePointerEvents) node.removeEventListener(type, meet, true); };
    }, [surface]);
}
