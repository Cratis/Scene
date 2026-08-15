// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FreeformSlotArrangement, HeightSizeClass, SizeClass, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFreeformSlotArrangement } from '../index';

interface FixtureVariant {
    width: WidthSizeClass;
    height: HeightSizeClass;
    tag: string;
}

interface FixtureCase {
    name: string;
    variants: FixtureVariant[];
    sizeClass: SizeClass;
    expectedTag: string | null;
}

interface FixtureCorpus {
    freeformCases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'layout-evaluation-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

describe('when evaluating against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.freeformCases) {
        it(`should match the expected tag for "${fixtureCase.name}"`, () => {
            const arrangement: FreeformSlotArrangement = {
                variants: fixtureCase.variants.map(variant => ({
                    sizeClass: { width: variant.width, height: variant.height },
                    placements: [{ slotName: variant.tag, x: 0, y: 0, width: 0, height: 0 }],
                })),
            };

            const result = evaluateFreeformSlotArrangement(arrangement, fixtureCase.sizeClass);
            if (fixtureCase.expectedTag === null) {
                (result === undefined).should.be.true;
            } else {
                result!.placements[0].slotName.should.equal(fixtureCase.expectedTag);
            }
        });
    }
});
