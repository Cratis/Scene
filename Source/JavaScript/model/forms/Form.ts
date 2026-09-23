// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateSource } from './PopulateSource';
import { FormField } from './FormField';
import { Behavior } from '../interactions';

/**
 * The command-side counterpart to a table or summary: a named, typed form for one command.
 */
export interface Form {
    name: string;
    forCommand: string;
    populateSource?: PopulateSource;
    fields: FormField[];
    /**
     * The behaviors attached here - what happens when someone interacts with it. Additive with whatever is
     * attached further out or further in.
     */
    behaviors?: Behavior[];
}

export const FormPropertyNames: (keyof Form)[] = ['name', 'forCommand', 'populateSource', 'fields', 'behaviors'];
