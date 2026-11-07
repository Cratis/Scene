// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletContribution } from '../outlets/OutletContribution';
import type { OutletRefinement } from '../outlets/OutletRefinement';

/**
 * The navigation a module declares: how it treats the application's outlets (`inherits`, `extends` or `overrides`,
 * with `hide` and `before`/`after`) and the items it contributes to them. An outlet the module does not refine is
 * inherited.
 */
export interface ModuleNavigation {
    /** The module identity. */
    module: string;

    /** How the module treats the outlets it inherits from the application. */
    refinements?: OutletRefinement[];

    /** The items the module contributes to outlets (`contribute to <outlet>`). */
    contributions?: OutletContribution[];
}

export const ModuleNavigationPropertyNames: (keyof ModuleNavigation)[] = ['module', 'refinements', 'contributions'];
