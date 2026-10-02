// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One field of what a query returns.
 */
export interface QueryResultField {
    name: string;

    /** The field's type name. */
    type: string;

    /** Whether the field identifies the item - the key a component can use for item identity. */
    isIdentity?: boolean;
}

export const QueryResultFieldPropertyNames: (keyof QueryResultField)[] = ['name', 'type', 'isIdentity'];
