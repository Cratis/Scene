// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a press on the shell around the screen does. The shell is context, not the thing being edited: a press on it never selects anything
// of the screen and never reaches a control of the shell - except the navigation entries, which are left to Scene so the destination can be
// peeked at (spec N2). Presses on the screen itself are the surface's, as before.
export enum ShellPointer {
    // Not on the shell: the screen's own handling applies.
    NotShell = 'notShell',

    // On a navigation entry: Scene handles it.
    Navigate = 'navigate',

    // Anywhere else on the shell: nothing happens.
    Ignore = 'ignore',
}

// The screen is marked by the editor's own wrapper around the composition; a navigation entry carries Scene's own marker for the screen it opens.
export const screenSelector = '[data-scene-id="composition"], [data-studio-element="composition"]';
export const navigationEntrySelector = '[data-scene-nav-item], [data-target-screen]';

export function decideShellPointer(target: EventTarget | null, shellShown: boolean): ShellPointer {
    if (!shellShown) return ShellPointer.NotShell;
    const element = target as Partial<Element> | null;
    if (!element || typeof element.closest !== 'function') return ShellPointer.NotShell;
    if (element.closest(screenSelector)) return ShellPointer.NotShell;
    return element.closest(navigationEntrySelector) ? ShellPointer.Navigate : ShellPointer.Ignore;
}
