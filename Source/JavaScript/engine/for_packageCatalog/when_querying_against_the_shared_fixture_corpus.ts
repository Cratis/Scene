// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { availablePackagesFor, baseComponentLibraries, componentsForPackages } from '../index';
import { CatalogFixtureCase, corpus } from '../for_packageDependencies/fixtures';

function run(fixtureCase: CatalogFixtureCase): string[] {
    switch (fixtureCase.query) {
        case 'baseComponentLibraries':
            return baseComponentLibraries(corpus.catalog).map((scenePackage) => scenePackage.name);
        case 'availableFor':
            return availablePackagesFor(corpus.catalog, fixtureCase.selected ?? []).map((scenePackage) => scenePackage.name);
        case 'componentsFor':
            return componentsForPackages(corpus.catalog, fixtureCase.selected ?? []);
        default:
            throw new Error(`The fixture corpus asks for an unknown query '${fixtureCase.query}'`);
    }
}

describe('when querying against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.catalogCases) {
        it(`should match the expected result for "${fixtureCase.name}"`, () => {
            run(fixtureCase).should.deep.equal(fixtureCase.expected);
        });
    }
});
