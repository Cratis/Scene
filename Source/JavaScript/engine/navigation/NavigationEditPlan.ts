// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationEdit } from './NavigationEdit';

/**
 * The edits an edit helper decided on, or why it refused.
 */
export interface NavigationEditPlan {
    /** The edits to apply, in order; empty when the helper refused or nothing needs to change. */
    edits: NavigationEdit[];

    /** Why the gesture is refused; absent when it is allowed. */
    rejected?: string;
}
