// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a key does on the canvas (spec N7). Arrows move between items and Enter activates the focused one natively, so only the
// keys with a meaning of their own are decided here.
export enum NavigationKeyAction {
    None = 'none',

    // Escape while peeking: back to the screen that was chosen.
    LeavePeek = 'leavePeek',

    // Escape in preview with nothing to leave: leave the preview.
    ExitPreview = 'exitPreview',

    // Enter on the peek bar, or Shift+Enter anywhere while peeking: open the peeked destination in the editor.
    OpenInEditor = 'openInEditor',
}

export interface NavigationKeyContext {
    previewing: boolean;
    peeking: boolean;
    // Whether the key went to the peek bar.
    onPeekBar: boolean;
}

export function navigationKeyAction(key: string, context: NavigationKeyContext, shift = false): NavigationKeyAction {
    if (key === 'Escape') {
        if (context.peeking) return NavigationKeyAction.LeavePeek;
        return context.previewing ? NavigationKeyAction.ExitPreview : NavigationKeyAction.None;
    }

    if (key === 'Enter' && context.peeking && (context.onPeekBar || shift)) return NavigationKeyAction.OpenInEditor;
    return NavigationKeyAction.None;
}
