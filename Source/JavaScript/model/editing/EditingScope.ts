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

    /**
     * For a template scope: the name of the layout the template ultimately sits in. A template does not say
     * which layout it belongs to, so a document with several layouts needs to be told. A screen scope reads it
     * from the screen itself.
     */
    layout?: string;
}

export const EditingScopePropertyNames: (keyof EditingScope)[] = ['kind', 'name', 'layout'];
