// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SceneElement } from '@cratis/scene.model';
import {
    ActionInspectionContext, EffectiveOutlet, EnablementRequest, PlacementProblem, PlacementRequest,
    argumentSourceKind, inspectActionElement, inspectOutletActions, resolveEnablement, resolvePlacement,
} from '../index';

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../placement-fixtures.json'), 'utf-8')) as {
    placement: { name: string; request: PlacementRequest; expected: unknown }[];
    enablement: { name: string; request: EnablementRequest; expected: unknown }[];
    inspection: {
        context: ActionInspectionContext;
        outlets: { name: string; outlet: EffectiveOutlet; context?: Partial<ActionInspectionContext>; expected: unknown[] }[];
        elements: { name: string; element: SceneElement; expected: unknown }[];
    };
    argumentSources: { source: string; expected: string | null }[];
};

describe('when checking placement, Opens and enablement against the shared fixture corpus', () => {
    it('should cover every placement problem', () => {
        const covered = new Set(corpus.placement.map(fixture => (fixture.expected as { problem?: string }).problem).filter(problem => problem !== undefined));
        [...covered].sort().should.deep.equal(Object.values(PlacementProblem).sort());
    });

    for (const fixture of corpus.placement) {
        it(`should place when ${fixture.name}`, () => resolvePlacement(structuredClone(fixture.request)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.enablement) {
        it(`should work out enablement for ${fixture.name}`, () => resolveEnablement(structuredClone(fixture.request)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.inspection.outlets) {
        it(`should inspect the actions of ${fixture.name}`, () =>
            inspectOutletActions(structuredClone(fixture.outlet), structuredClone({ ...corpus.inspection.context, ...fixture.context })).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.inspection.elements) {
        it(`should inspect ${fixture.name}`, () =>
            inspectActionElement(structuredClone(fixture.element), structuredClone(corpus.inspection.context)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.argumentSources) {
        it(`should tell where the argument source '${fixture.source}' gets its value`, () =>
            [argumentSourceKind(fixture.source) ?? null].should.deep.equal([fixture.expected]));
    }
});
