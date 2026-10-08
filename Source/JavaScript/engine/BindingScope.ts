// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Runtime values available to resolve typed bindings.
 */
export interface BindingScope {
    /** Inherited effective data context for the element. */
    dataContext?: unknown;

    /** Query results keyed by the model's query binding name. */
    queryResults?: Record<string, unknown>;

    /** Component output properties keyed by stable element id. */
    componentOutputs?: Record<string, Record<string, unknown>>;
}
