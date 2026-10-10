// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingScope } from './BindingScope';
import { QueryBindingTicket } from './QueryBindingTicket';

/**
 * Keeps the results of bound queries as their arguments change. Every rebind starts a new generation; a
 * result is accepted only for the latest generation of its query, so a slow answer for a previous
 * selection is discarded instead of overwriting the current one. Clearing a query - its arguments became
 * unavailable, or its element left the tree - removes the result and invalidates any run in flight.
 *
 * The C# engine (`QueryBindingState`) behaves identically; both run `binding-resolution-fixtures.json`.
 */
export class QueryBindingState {
    readonly #generations = new Map<string, number>();
    readonly #results = new Map<string, unknown>();

    /** Starts a run of a query with new arguments, invalidating every earlier run of that query. */
    begin(query: string): QueryBindingTicket {
        const generation = (this.#generations.get(query) ?? 0) + 1;
        this.#generations.set(query, generation);
        return { query, generation };
    }

    /** Records a run's result. Returns false, and keeps the current result, when the run is stale. */
    complete(ticket: QueryBindingTicket, result: unknown): boolean {
        if (this.#generations.get(ticket.query) !== ticket.generation) return false;
        this.#results.set(ticket.query, result);
        return true;
    }

    /** Removes a query's result and invalidates any run still in flight. */
    clear(query: string): void {
        this.#generations.set(query, (this.#generations.get(query) ?? 0) + 1);
        this.#results.delete(query);
    }

    /** The accepted results, as the query results of a binding scope. */
    get queryResults(): NonNullable<BindingScope['queryResults']> {
        return Object.fromEntries(this.#results);
    }
}
