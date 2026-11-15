// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StructuredEditorStrings } from './StructuredEditorStrings';

export const defaultStructuredEditorStrings: StructuredEditorStrings = {
    unset: 'Not set',
    item: 'Item',
    itemTitle: (item, position) => `${item} ${position}`,
    add: item => `Add ${item.toLowerCase()}`,
    remove: (item, position) => `Remove ${item.toLowerCase()} ${position}`,
    removeText: 'Remove',
    moveUp: (item, position) => `Move ${item.toLowerCase()} ${position} up`,
    moveUpText: 'Up',
    moveDown: (item, position) => `Move ${item.toLowerCase()} ${position} down`,
    moveDownText: 'Down',
    entry: position => `Entry ${position}`,
    moveEntryUp: position => `Move entry ${position} up`,
    moveEntryDown: position => `Move entry ${position} down`,
    removeEntry: position => `Remove entry ${position}`,
    addEntry: 'Add entry',
    useList: 'Use a list',
    useSingle: 'Use one value',
    scalarType: 'Type',
    scalarText: 'Text',
    scalarNumber: 'Number',
    scalarFlag: 'Yes or no',
    scalarFlagOn: 'Yes',
    mapName: position => `Name ${position}`,
    mapValue: name => `Value of ${name}`,
    addMapEntry: 'Add value',
    removeMapEntry: name => `Remove ${name}`,
    keptValue: 'A structured value, kept as it is.',
    mismatch: (property, problem) => `The saved value of '${property}' does not fit what it is described as: ${problem}.`,
    convert: 'Give its items identifiers',
    clear: 'Clear the value',
    noEditor: property => `'${property}' has no editor: nothing describes what it holds, so it cannot be edited here.`,
};
