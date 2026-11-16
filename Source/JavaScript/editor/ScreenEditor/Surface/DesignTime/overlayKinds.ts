// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What an overlay component is, so the surface can show the thing it opens rather than the control that opens it.
export enum OverlayKind {

    // A window over the screen with a title and content: dialogs, confirmations, side panels.
    Window = 'window',

    // A short message that appears over the screen.
    Toast = 'toast',

    // A hint that appears beside what it is for.
    Tooltip = 'tooltip',

    // A mask laid over content to stop it being used.
    Mask = 'mask',

    // A window that says something is being waited for.
    Busy = 'busy',
}

// The overlay components, by bare name. A component is an overlay because it draws nothing where it sits - it opens something over the
// screen - which is exactly what an author cannot see on a surface that only draws what is in place.
export const overlayKinds: Readonly<Record<string, OverlayKind>> = {
    dialog: OverlayKind.Window,
    confirmDialog: OverlayKind.Window,
    confirmationDialog: OverlayKind.Window,
    // The task dialog a toolbar button opens for a State Change slice (Scene 4.28).
    sliceDialog: OverlayKind.Window,
    commandDialog: OverlayKind.Window,
    stepperCommandDialog: OverlayKind.Window,
    // The blueprint's frame around a dialog template's content.
    dialogFrame: OverlayKind.Window,
    overlayPanel: OverlayKind.Window,
    sidebar: OverlayKind.Window,
    toast: OverlayKind.Toast,
    tooltip: OverlayKind.Tooltip,
    blockUI: OverlayKind.Mask,
    busyIndicatorDialog: OverlayKind.Busy,
};
