// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One parameter a query takes.
 */
export interface QueryParameter {
    name: string;

    /** The parameter's type name, compared with the type of whatever is bound to it. */
    type: string;

    required: boolean;
}

export const QueryParameterPropertyNames: (keyof QueryParameter)[] = ['name', 'type', 'required'];
