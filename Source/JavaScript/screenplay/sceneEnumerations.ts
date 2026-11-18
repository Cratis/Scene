// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The names the Scene editor writes for each enumeration, in the order the .NET contracts number them - the mirror
// of SceneEnumerations. A document may spell an enumeration by name in any casing or by its position, which is how
// the two serializations of the Scene model write it.
export const bindingKinds = ['dataContext', 'queryResult', 'componentProperty', 'literal'] as const;
export const bindingModes = ['oneWay', 'twoWay'] as const;
export const nullBehaviors = ['propagate', 'clear', 'preserve'] as const;
export const generationModes = ['auto', 'manual'] as const;
export const widthUnits = ['fraction', 'pixels', 'percent', 'auto'] as const;
export const triggerKinds = ['Click', 'DoubleClick', 'Select', 'Submit', 'Change', 'Load', 'Unload', 'Enter', 'Leave'] as const;
export const notificationLevels = ['Info', 'Warning', 'Error'] as const;
export const actionKinds = ['ExecuteCommand', 'Navigate', 'NavigateBack', 'OpenDialog', 'CloseDialog', 'RefreshQuery', 'SetState', 'Notify', 'Confirm', 'RaiseTrigger'] as const;
export const visibilities = ['Visible', 'Hidden', 'Collapsed'] as const;
export const horizontalAlignments = ['Stretch', 'Left', 'Center', 'Right'] as const;
export const verticalAlignments = ['Stretch', 'Top', 'Center', 'Bottom'] as const;

// The members whose values are enumerations, so a document can be compared regardless of which serialization wrote it.
export const enumerationsByMember: Readonly<Record<string, readonly string[]>> = {
    mode: bindingModes,
    nullBehavior: nullBehaviors,
    generationMode: generationModes,
    unit: widthUnits,
    level: notificationLevels,
    visibility: visibilities,
    horizontalAlignment: horizontalAlignments,
    verticalAlignment: verticalAlignments,
};

// An enumeration value by its name in any casing, or by its position.
export const enumerationIndexOf = (value: unknown, names: readonly string[]): number | undefined => {
    if (typeof value === 'string') {
        const index = names.findIndex(name => name.toLowerCase() === value.toLowerCase());
        return index < 0 ? undefined : index;
    }
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < names.length) return value;
    return undefined;
};
