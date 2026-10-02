// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind } from './EditingScopeKind';

/**
 * The thing being edited. What it owns is local and editable; what an outer layout or template owns is inherited,
 * and can only be configured through what that owner exposed.
 */
export interface EditingScope {
    kind: `${EditingScopeKind}`;

    /** The name of the screen, template or layout. */
    name: string;
}

export const EditingScopePropertyNames: (keyof EditingScope)[] = ['kind', 'name'];
