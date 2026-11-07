// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout, NavigationModel, Screen, ScreenTemplate } from '@cratis/scene.model';
import { OutletLevel } from './OutletLevel';

/**
 * What the chain of outlet levels of a screen is built from. A Scene document is one (it has `layouts`,
 * `screenTemplates` and `screens`); a host adds the navigation model and the levels of its modules and features.
 */
export interface OutletChainSource {
    /** The layouts; the screen's layout is a level. */
    layouts?: Layout[];

    /** The screen templates; the screen's template is a level. */
    screenTemplates?: ScreenTemplate[];

    /** The screens; the screen is the last level, and every other screen's outlet contributions apply too. */
    screens?: Screen[];

    /** The navigation model: its application outlets are the top level, and a module's refinements and contributions join that module's level. */
    navigation?: NavigationModel;

    /**
     * The levels of modules and features the host knows, such as the refinements a feature makes to the toolbar. A level
     * whose name is in the screen's `path` joins the chain there; any other contributes.
     */
    levels?: OutletLevel[];
}
