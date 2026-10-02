// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { IconImpactReport, analyzeIconImpact } from '../../index';
import { alpha, alphaEntries, alphaName, catalog, countingSource, openCatalog } from '../for_iconFixtures/iconFixtures';
import { usages } from './fixtures';

describe('when a library is upgraded and drops an icon', () => {
    let report: IconImpactReport;

    beforeEach(async () => {
        const upgraded: ScenePackage = { ...alpha, version: '1.3.0', kind: PackageKind.IconLibrary };
        const current = openCatalog([alphaName], [countingSource(alphaName, alphaEntries)]);
        const proposed = openCatalog([alphaName], [countingSource(alphaName, alphaEntries.filter((entry) => entry.key !== 'trash'))], [upgraded, ...catalog.slice(1)]);
        report = await analyzeIconImpact(usages.slice(0, 2), current, proposed);
    });

    it('should report only the dropped icon as affected', () => report.affected.map((item) => item.usage.location).should.deep.equal(['orders/delete']));
    it('should say why', () => report.affected[0].diagnostic.kind.should.equal('missing-icon'));
    it('should count the icon that survives', () => report.unaffectedCount.should.equal(1));
});
