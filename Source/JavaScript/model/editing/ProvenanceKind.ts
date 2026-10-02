// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a node comes from, relative to the editing scope.
 */
export enum ProvenanceKind {
    /** Owned by the thing being edited. Fully editable. */
    Local = 'local',

    /** Owned by an outer layout or template that exposed nothing on it. Read-only here. */
    Inherited = 'inherited',

    /** Owned by an outer layout or template that exposed some of its properties. Those can be configured here. */
    ConfigurableInherited = 'configurableInherited',
}
