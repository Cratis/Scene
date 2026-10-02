// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconImpactReport, analyzeIconImpact } from '../../index';
import { alphaName, betaName, defaultSources, openCatalog } from '../for_iconFixtures/iconFixtures';
import { usages } from './fixtures';

describe('when values are legacy strings', () => {
    let report: IconImpactReport;

    beforeEach(async () => {
        const current = openCatalog([alphaName, betaName], defaultSources());
        report = await analyzeIconImpact([usages[4], { value: 'pi pi-home', location: 'legacy/other' }], current, current);
    });

    it('should never count them as affected', () => report.affected.should.be.empty);
    it('should offer every library\'s icon of that name as a candidate', () => report.legacy[0].candidates.map((candidate) => candidate.library.library).should.deep.equal([alphaName, betaName]));
    it('should offer no candidate for a string that names no icon', () => report.legacy[1].candidates.should.be.empty);
});
