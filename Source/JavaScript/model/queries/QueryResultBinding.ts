// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Connects one field of a query's result to something the consuming component displays.
 */
export interface QueryResultBinding {
    /** What the field feeds: a column key, a label slot - whatever the component's descriptor names. */
    target: string;

    /** The name of the result field. */
    field: string;
}

export const QueryResultBindingPropertyNames: (keyof QueryResultBinding)[] = ['target', 'field'];
