// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The package whose meaning the editor's own features rely on.
export const corePackageName = 'core';

// The name a component is stored under when it is inserted: the package that offers it in the palette, then the component -
// `PrimeReact:button`, `Cratis.Components:commandForm`. Storing the package with the component is what lets the screen travel
// typed to Screenplay, Stage and Play (a bare name is a decision the UI profile makes later, and a screen holding one cannot be
// carried as typed Screenplay), and it pins the editor's own components - the `core` action that submits a modeled command - to
// the package that gives them their meaning, whatever a profile lists last.
export function insertedComponentName(componentName: string, packageName: string): string {
    return componentName.includes(':') ? componentName : `${packageName}:${componentName}`;
}
