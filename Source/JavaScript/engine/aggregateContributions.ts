// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Contribution } from '@cratis/scene.model';

/**
 * Aggregates every {@link Contribution} targeting a given contribution point, in render order - part of
 * Cratis/Scene#2. A widget bound to a contribution point is never wired to a fixed source: call this
 * again whenever the underlying contribution set changes and it recomputes, the same way a projection
 * recomputes a read model from events.
 *
 * Resolving *which* contribution point a `contribute to` declaration targets (nearest enclosing, or an
 * explicit override) already happened before a {@link Contribution} exists in this model - see its own
 * doc comment - so there is no ambiguity left to resolve here, only ordering.
 *
 * @param contributions Every contribution in scope, targeting any contribution point.
 * @param contributionPointName The name of the contribution point to aggregate.
 * @returns The matching contributions, ordered by `order` ascending; contributions with no `order` sort after every ordered one, in their original relative order.
 */
export function aggregateContributions(contributions: Contribution[], contributionPointName: string): Contribution[] {
    return contributions
        .map((contribution, index) => ({ contribution, index }))
        .filter(({ contribution }) => contribution.contributionPointName === contributionPointName)
        .sort((a, b) => {
            if (a.contribution.order === undefined && b.contribution.order === undefined) {
                return a.index - b.index;
            }

            if (a.contribution.order === undefined) {
                return 1;
            }

            if (b.contribution.order === undefined) {
                return -1;
            }

            return a.contribution.order - b.contribution.order;
        })
        .map(({ contribution }) => contribution);
}
