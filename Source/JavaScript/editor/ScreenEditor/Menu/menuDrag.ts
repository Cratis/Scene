// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

const panelOf = (source: Element): HTMLElement | null => source.closest<HTMLElement>('.studio-menu-popover__panel');

// Something is being dragged out of a menu. The menu opens over the screen it is dragged onto, so it steps back: it turns see-through at once, and once the
// drag is under way it stops taking the pointer, so what it covers can be dropped on. Taking the pointer away in the very event the drag starts would
// cancel the drag in some browsers, which is why that waits a frame.
export const beginMenuDrag = (source: Element): void => {
    const panel = panelOf(source);
    if (!panel) return;
    panel.setAttribute('data-dragging', '');
    window.requestAnimationFrame(() => {
        if (panel.hasAttribute('data-dragging')) panel.setAttribute('data-passing', '');
    });
};

export const endMenuDrag = (source: Element): void => {
    const panel = panelOf(source);
    panel?.removeAttribute('data-dragging');
    panel?.removeAttribute('data-passing');
};
