// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A named point in the element tree that a widget declares (`contributes <Name>`) and that other
 * templates contribute content to (`contribute to <Name>`). Aggregation is a computed view over
 * whatever is currently contributed from the tree beneath it — a widget bound to a contribution point
 * is never wired to a fixed source.
 */
export interface ContributionPoint {
    name: string;
}

export const ContributionPointPropertyNames: (keyof ContributionPoint)[] = ['name'];
