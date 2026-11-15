// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Whether a component is the core package's component of that name. A scene names a component by its package - `core:text`, or `core.text` where a package is
// separated by a dot - or by the bare name, which resolves to the core package when no other package of the profile has one.
export function isCoreComponent(componentName: string | undefined, name: string): boolean {
    if (componentName === undefined) return false;
    const separator = Math.max(componentName.lastIndexOf(':'), componentName.lastIndexOf('.'));
    const bare = componentName.slice(separator + 1);
    const prefix = separator < 0 ? 'core' : componentName.slice(0, separator);
    return bare === name && prefix === 'core';
}
