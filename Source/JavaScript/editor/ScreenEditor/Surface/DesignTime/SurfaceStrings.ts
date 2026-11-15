// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The words the surface draws over the screen while it is being designed. None of them is part of the designed screen.
export interface SurfaceStrings {

    // Shown in an empty container, which would otherwise be invisible and could not be dropped on.
    emptyContainer: string;

    // The label of the grip that moves the selected element, with its name.
    moveHandle: (name: string) => string;

    // Spoken, politely, while something is dragged over the surface: where a drop would go.
    dropTarget: (where: 'into' | 'between') => string;

    // Shown where a drop is not allowed.
    dropDenied: string;

    // Shown in place of a component that draws nothing, such as a data declaration, so it can still be seen and selected.
    nothingToShow: (name: string) => string;

    // Shown as a compact chip for a component that declares something and draws nothing by design, such as data.
    declaration: (name: string) => string;

    // The tooltip on content the surface shows from a sample because the element sets none, naming the properties to set.
    sampleContent: (properties: string[]) => string;

    // The tag on the frame of an overlay shown in place, so it is not mistaken for part of the screen.
    overlay: (name: string) => string;

    // Shown in place of a component the UI profile does not provide.
    unavailable: (name: string) => string;

    // Shown in place of a component that failed while drawing, with what it said.
    failedToDraw: (name: string, reason: string) => string;
}
