// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryOrigin } from './QueryOrigin';
import { QueryParameter } from './QueryParameter';
import { QueryResultField } from './QueryResultField';
import { QueryResultShape } from './QueryResultShape';

/**
 * A query a property may be bound to, as supplied by the host.
 *
 * Scene never discovers queries itself - it has no idea what the application's backend offers. The host (Studio)
 * works out which queries are in scope for the thing being edited and hands them in, in this shape, which is
 * what keeps discovery out of the model and binding validation inside it.
 */
export interface QueryCandidate {
    /** The query's stable identity, which survives a rename. Bindings refer to it. */
    id: string;

    /** The query's display name - the name the binding registry resolves at runtime. */
    name: string;

    /** The path from the editing scope down to the query's owner, outermost first. */
    origin: QueryOrigin[];

    parameters: QueryParameter[];

    /** How many results the query produces. Accepts the {@link QueryResultShape} members or their string values. */
    resultShape: `${QueryResultShape}`;

    /** The fields of one result item. */
    resultFields: QueryResultField[];
}

export const QueryCandidatePropertyNames: (keyof QueryCandidate)[] = [
    'id', 'name', 'origin', 'parameters', 'resultShape', 'resultFields',
];
