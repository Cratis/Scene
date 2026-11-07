// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Outlet, OutletContribution, OutletRefinement } from '@cratis/scene.model';
import { OutletLevelKind } from './OutletLevelKind';

/**
 * One level of the chain an outlet resolves through - a layout, template, module, feature, slice or screen - with what
 * it says about outlets.
 */
export interface OutletLevel {
    /** Where in the chain the level sits. */
    kind: OutletLevelKind;

    /** The name editors show for the level, such as `Catalog` or `Products`; it is what provenance and summaries name. */
    name: string;

    /** The outlets the level declares, with their defaults. */
    outlets?: Outlet[];

    /** How the level treats outlets it inherits. */
    refinements?: OutletRefinement[];

    /** The items the level contributes to outlets. */
    contributions?: OutletContribution[];
}
