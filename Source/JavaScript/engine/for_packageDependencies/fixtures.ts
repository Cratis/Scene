// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ScenePackage } from '@cratis/scene.model';

export interface ResolutionFixtureCase {
    name: string;
    selected: string[];
    expectedPackages: string[];
    expectedAdded: string[];
    expectedMissing: { package: string; dependsOn: string }[];
    expectedVersionConflicts: { package: string; dependsOn: string; requiredRange: string; actualVersion: string }[];
    expectedCycles: string[][];
}

export interface VersionRangeFixtureCase {
    version: string;
    range: string | null;
    expected: boolean;
}

export interface CatalogFixtureCase {
    name: string;
    query: string;
    selected?: string[];
    expected: string[];
}

interface FixtureCorpus {
    catalog: ScenePackage[];
    resolutionCases: ResolutionFixtureCase[];
    versionRangeCases: VersionRangeFixtureCase[];
    catalogCases: CatalogFixtureCase[];
}

const fixturePath = join(import.meta.dirname, '..', '..', '..', '..', 'package-dependency-fixtures.json');

/**
 * The same corpus the C# specs read, so both languages resolve against an identical catalog rather than
 * two hand-written ones that can quietly diverge.
 */
export const corpus = JSON.parse(readFileSync(fixturePath, 'utf-8')) as FixtureCorpus;
