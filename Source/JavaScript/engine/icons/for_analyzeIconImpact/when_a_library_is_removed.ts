// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconImpactReport, analyzeIconImpact } from '../../index';
import { alphaName, betaName, defaultSources, openCatalog } from '../for_iconFixtures/iconFixtures';
import { usages } from './fixtures';

describe('when a library is removed', () => {
    let report: IconImpactReport;

    beforeEach(async () => {
        const current = openCatalog([alphaName, betaName], defaultSources());
        const proposed = openCatalog([betaName], defaultSources());
        report = await analyzeIconImpact(usages, current, proposed);
    });

    it('should report the references to the removed library as affected', () => {
        report.affected.filter((item) => item.diagnostic.kind === 'missing-library').map((item) => item.usage.location).should.deep.equal(['shell/menu', 'orders/delete']);
    });

    it('should mark the ones that used to resolve', () => report.affected.find((item) => item.usage.location === 'shell/menu')!.wasResolvable.should.be.true);
    it('should mark a reference that was already broken', () => report.affected.find((item) => item.usage.location === 'orders/old')!.wasResolvable.should.be.false);
    it('should count the references that still resolve', () => report.unaffectedCount.should.equal(1));
    it('should not rewrite anything', () => (usages[0].value as { library: string }).library.should.equal(alphaName));
});
