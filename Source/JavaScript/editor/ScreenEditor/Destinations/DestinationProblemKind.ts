// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What is wrong with an authored destination, in a way the author can fix.
export enum DestinationProblemKind {
    // The destination leads nowhere: no screen, route, dialog or slice.
    NoTarget = 'noTarget',

    // The screen is not one this application has.
    UnknownScreen = 'unknownScreen',

    // The route is not an absolute path with well-formed, unique parameters.
    InvalidRoute = 'invalidRoute',

    // The slot is not one the layouts and templates in play declare.
    UnknownSlot = 'unknownSlot',

    // The dialog is not a dialog template of this document.
    UnknownDialog = 'unknownDialog',

    // The slice is not a state change this screen can reach.
    UnknownSlice = 'unknownSlice',

    // The destination says it opens in a slot but names none.
    SlotKindWithoutSlot = 'slotKindWithoutSlot',

    // The destination says it opens a dialog but names none.
    DialogKindWithoutDialog = 'dialogKindWithoutDialog',

    // The destination says it leaves the application but has no route to leave to.
    ExternalKindWithoutRoute = 'externalKindWithoutRoute',
}
