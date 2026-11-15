// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The words of the structured value editor. The host supplies them; `defaultStructuredEditorStrings` is the English a host that
// supplies none gets.
export interface StructuredEditorStrings {
    // The choice that leaves an enum field unset.
    unset: string;

    // What one entry of a collection is called when its descriptor does not say.
    item: string;
    itemTitle: (item: string, position: number) => string;
    add: (item: string) => string;
    remove: (item: string, position: number) => string;
    removeText: string;
    moveUp: (item: string, position: number) => string;
    moveUpText: string;
    moveDown: (item: string, position: number) => string;
    moveDownText: string;

    // The entries of a list of plain values.
    entry: (position: number) => string;
    moveEntryUp: (position: number) => string;
    moveEntryDown: (position: number) => string;
    removeEntry: (position: number) => string;
    addEntry: string;

    // A word that may be one or a list, and a record of values under names of the author's choosing.
    useList: string;
    useSingle: string;
    scalarType: string;
    scalarText: string;
    scalarNumber: string;
    scalarFlag: string;
    scalarFlagOn: string;
    mapName: (position: number) => string;
    mapValue: (name: string) => string;
    addMapEntry: string;
    removeMapEntry: (name: string) => string;
    keptValue: string;

    // What a value that does not fit its descriptor says - one saved before the descriptor described it - and how to put it right.
    mismatch: (property: string, problem: string) => string;
    convert: string;
    clear: string;

    // What a property that nothing describes says instead of showing a box to type JSON into.
    noEditor: (property: string) => string;
}
