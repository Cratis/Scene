// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarButton } from './ToolbarButton';

/**
 * The buttons of a toolbar, in order.
 */
export interface Toolbar {
    /** The buttons. */
    buttons: ToolbarButton[];
}

export const ToolbarPropertyNames: (keyof Toolbar)[] = ['buttons'];
