// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryOriginKind } from './QueryOriginKind';

/**
 * One step on the path from the editing scope down to the owner of a query.
 *
 * `kind` accepts both the {@link QueryOriginKind} members and their plain string values (`'feature'`,
 * `'slice'`), so a host that builds candidates from JSON does not have to import the enum.
 */
export interface QueryOrigin {
    kind: `${QueryOriginKind}`;
    id: string;
    name: string;
}

export const QueryOriginPropertyNames: (keyof QueryOrigin)[] = ['kind', 'id', 'name'];
