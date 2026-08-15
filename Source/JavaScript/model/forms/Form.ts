// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateSource } from './PopulateSource';
import { FormField } from './FormField';

/**
 * The command-side counterpart to a table or summary: a named, typed form for one command.
 */
export interface Form {
    name: string;
    forCommand: string;
    populateSource?: PopulateSource;
    fields: FormField[];
}

export const FormPropertyNames: (keyof Form)[] = ['name', 'forCommand', 'populateSource', 'fields'];
