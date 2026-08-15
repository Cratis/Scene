// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';

/**
 * One piece of content contributed to a {@link ContributionPoint}. Resolution to a specific
 * contribution point (nearest enclosing, or an explicit `... in <ContributionPoint>` override) happens
 * before this model is built — this record already carries the resolved target.
 */
export interface Contribution {
    contributionPointName: string;
    content: SceneElement;
    order?: number;
}

export const ContributionPropertyNames: (keyof Contribution)[] = ['contributionPointName', 'content', 'order'];
