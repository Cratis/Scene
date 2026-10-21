// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PackageKind, UiProfile } from '@cratis/scene.model';
import { ComponentResolution, PackageCatalog, hostProfilePackages, resolveComponentName } from '../index';

interface Kinds { [name: string]: PackageKind }
interface OrderCase { name: string; declared: string[]; baseline: string; kinds: Kinds; expected: string[] }
interface ResolutionCase { name: string; declared: string[]; baseline: string; kinds: Kinds; catalog: PackageCatalog; requestedName: string; expected: ComponentResolution }

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', '..', 'package-resolution-fixtures.json'), 'utf-8')) as { hostPackageCases: OrderCase[]; hostResolutionCases: ResolutionCase[] };

describe('when ordering the host packages', () => {
    for (const fixtureCase of corpus.hostPackageCases) {
        it(`should match the expected order for "${fixtureCase.name}"`, () =>
            hostProfilePackages(fixtureCase.declared, { baseline: fixtureCase.baseline, catalog: fixtureCase.kinds }).should.deep.equal(fixtureCase.expected));
    }

    for (const fixtureCase of corpus.hostResolutionCases) {
        it(`should resolve as expected: ${fixtureCase.name}`, () => {
            const packages = hostProfilePackages(fixtureCase.declared, { baseline: fixtureCase.baseline, catalog: fixtureCase.kinds });
            const profile: UiProfile = { name: 'test', targetPlatform: 'web', packages };
            resolveComponentName(fixtureCase.requestedName, profile, fixtureCase.catalog)!.should.deep.equal(fixtureCase.expected);
        });
    }
});
