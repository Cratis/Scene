// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationModel } from '@cratis/scene.model';

/**
 * The result of applying navigation edits. Either every edit applies, or none does and `model` is the model given.
 */
export interface NavigationEditOutcome {
    /** Whether every edit was applied. */
    applied: boolean;

    /** The model after the edits; the model given when they were not applied. */
    model: NavigationModel;

    /** Why the edits were refused; absent when they were applied. */
    rejected?: string;
}
