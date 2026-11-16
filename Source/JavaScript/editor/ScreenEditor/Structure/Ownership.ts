// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Who owns a piece of the composed screen, relative to the scope being edited.
export enum Ownership {

    // Authored in the scope being edited - fully editable.
    Local = 'local',

    // Inherited from a template - visible and inspectable, but structurally locked.
    Inherited = 'inherited',

    // Inherited from a template that exposes settings to the current scope - only those settings can change.
    ConfigurableInherited = 'configurableInherited',
}
