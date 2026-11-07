// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InputSourceKind } from './InputSourceKind';

/**
 * One input of the command a slice submits, and where it gets its value when the action runs.
 */
export interface PlacementInput {
    /** The name of the input, such as `price`. */
    name: string;

    /** Where the input's value comes from; absent when nothing feeds it, so only a form can ask for it. */
    source?: InputSourceKind;
}
