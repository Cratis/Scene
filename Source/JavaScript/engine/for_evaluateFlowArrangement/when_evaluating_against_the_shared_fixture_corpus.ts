// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ExternalComponent, FlowArrangement, FlowLeaf, FlowOverride, HeightSizeClass, HorizontalAlignment, SizeClass, VerticalAlignment, Visibility, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFlowArrangement } from '../index';

interface FixtureOverride {
    width: WidthSizeClass | null;
    height: HeightSizeClass | null;
    tag: string;
}

interface FixtureCase {
    name: string;
    rootTag: string;
    overrides: FixtureOverride[];
    sizeClass: SizeClass;
    expectedTag: string;
}

interface FixtureCorpus {
    flowCases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'layout-evaluation-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

function leaf(tag: string): FlowLeaf {
    const content: ExternalComponent = {
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
    return { content };
}

describe('when evaluating against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.flowCases) {
        it(`should match the expected tag for "${fixtureCase.name}"`, () => {
            const arrangement: FlowArrangement = {
                root: leaf(fixtureCase.rootTag),
                overrides: fixtureCase.overrides.map((override): FlowOverride => ({
                    width: override.width ?? undefined,
                    height: override.height ?? undefined,
                    root: leaf(override.tag),
                })),
            };

            const result = evaluateFlowArrangement(arrangement, fixtureCase.sizeClass) as FlowLeaf;
            (result.content as ExternalComponent).id.should.equal(fixtureCase.expectedTag);
        });
    }
});
