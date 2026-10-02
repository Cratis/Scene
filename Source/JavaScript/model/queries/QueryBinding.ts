// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryArgumentBinding } from './QueryArgumentBinding';
import { QueryResultBinding } from './QueryResultBinding';

/**
 * The value of a `QueryReference` property: which query, what feeds each of its parameters, and which result
 * fields feed what. Every connection is stated explicitly - nothing is matched by name or position.
 */
export interface QueryBinding {
    /** The stable identity of the bound {@link QueryCandidate}. */
    queryId: string;

    /** The query name the binding registry resolves at runtime - a snapshot of the candidate's name when bound. */
    query: string;

    arguments: QueryArgumentBinding[];
    results: QueryResultBinding[];
}

export const QueryBindingPropertyNames: (keyof QueryBinding)[] = ['queryId', 'query', 'arguments', 'results'];
