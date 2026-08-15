// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ElementPlacement, ExternalComponent, FreeformArrangement, HeightSizeClass, HorizontalAlignment, SizeClass, VerticalAlignment, Visibility, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFreeformArrangement } from '../index';

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

function placement(tag: string): ElementPlacement {
    const element: ExternalComponent = {
        id: tag,
        name: tag,
        properties: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        componentName: 'core:text',
        slots: {},
    };
    return { element, x: 0, y: 0, width: 0, height: 0 };
}

describe('when evaluating against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.freeformCases) {
        it(`should match the expected tag for "${fixtureCase.name}"`, () => {
            const arrangement: FreeformArrangement = {
                variants: fixtureCase.variants.map(variant => ({
                    sizeClass: { width: variant.width, height: variant.height },
                    placements: [placement(variant.tag)],
                })),
            };

            const result = evaluateFreeformArrangement(arrangement, fixtureCase.sizeClass);
            if (fixtureCase.expectedTag === null) {
                (result === undefined).should.be.true;
            } else {
                (result!.placements[0].element as ExternalComponent).id.should.equal(fixtureCase.expectedTag);
            }
        });
    }
});
