// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { crashReportRequest } from '../crashReport';

describe('when building the report request', () => {
    const request = crashReportRequest(new Error('Boom with ?token=hidden123'),
        { surface: 'The event model board', template: 'StorefrontShell' }, '\n    at FeatureHeaderCell (a.js:1:1)');

    it('should title the report with what stopped', () => request.title.should.contain('The event model board crashed'));
    it('should summarize the component, the template and the error', () => {
        request.summary.should.contain('Component: FeatureHeaderCell');
        request.summary.should.contain('Template: StorefrontShell');
        request.summary.should.contain('Error: Boom');
    });
    it('should carry the full technical detail', () => request.details.should.contain('Component stack:'));
    it('should never carry a secret', () => { request.summary.should.not.contain('hidden123'); request.details.should.not.contain('hidden123'); });
});
