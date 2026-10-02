// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IconReference } from '../IconReference';

export interface FormatCase {
    name: string;
    reference: IconReference;
    expected: string;
}

export interface ParseCase {
    name: string;
    text: string;
    expected: IconReference | null;
}

export interface EqualityCase {
    name: string;
    left: IconReference;
    right: IconReference;
    expected: boolean;
}

const path = join(import.meta.dirname, '..', '..', '..', '..', '..', 'icon-reference-fixtures.json');

export const corpus = JSON.parse(readFileSync(path, 'utf-8')) as {
    formatCases: FormatCase[];
    parseCases: ParseCase[];
    equalityCases: EqualityCase[];
};
