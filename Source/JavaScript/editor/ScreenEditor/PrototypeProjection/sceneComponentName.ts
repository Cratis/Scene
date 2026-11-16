// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Legacy prototype components whose class name differs from the Scene component that renders them.
const renamed: Record<string, string> = {
    DatePicker: 'calendar',
    OrgChart: 'organizationChart',
    Chips: 'chips',
    ToggleButton: 'toggleSwitch',
};

const unrenamed = Object.fromEntries(Object.entries(renamed).map(([legacy, scene]) => [scene, legacy]));

// The Scene component name for a legacy type such as PrimeReact.InputText: the library is dropped, the name lower-camel-cased.
export function sceneComponentName(legacyType: string): string {
    const bare = legacyType.includes('.') ? legacyType.slice(legacyType.lastIndexOf('.') + 1) : legacyType;
    return renamed[bare] ?? bare.charAt(0).toLowerCase() + bare.slice(1);
}

// The legacy class name for a Scene component name, the inverse of sceneComponentName.
export function legacyClassName(componentName: string): string {
    const bare = componentName.includes(':') ? componentName.slice(componentName.lastIndexOf(':') + 1) : componentName;
    return unrenamed[bare] ?? bare.charAt(0).toUpperCase() + bare.slice(1);
}

// The library part of a legacy type, or an empty string when it has none.
export function legacyLibrary(legacyType: string): string {
    return legacyType.includes('.') ? legacyType.slice(0, legacyType.lastIndexOf('.')) : '';
}
