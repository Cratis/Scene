// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Layout, Screen, ScreenTemplate } from '@cratis/scene.model';
import { NavigationEntry } from './NavigationEntry';

/**
 * Everything navigation diagnostics look at. The catalogs are optional: an absent catalog means "not known
 * here", so targets in it are not reported as unavailable. An empty catalog means "known to be empty".
 */
export interface NavigationGraph {
    /** The destinations to check, in authored order. */
    entries: NavigationEntry[];

    /** The screens destinations may open. */
    screens?: Screen[];

    /** The layouts that may own outlets. */
    layouts?: Layout[];

    /** The screen templates that may own outlets, and that give screens their semantic type. */
    screenTemplates?: ScreenTemplate[];

    /** The dialog templates dialog destinations may open. */
    dialogTemplates?: DialogTemplate[];
}
