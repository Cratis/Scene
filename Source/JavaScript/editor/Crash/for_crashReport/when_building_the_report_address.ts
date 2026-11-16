// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentOfStack, configureCrashReportLinks, crashReportUrl, type CrashReportRequest } from '../crashReport';

describe('when building the report address', () => {
    const error = new Error('Boom with ?token=hidden123');
    const stack = '\n    at IndicatorButton (a.js:1:1)';
    const defaultAddress = crashReportUrl(error, { surface: 'The preview', template: 'StorefrontShell' }, stack);
    let request: CrashReportRequest | undefined;

    configureCrashReportLinks(given => { request = given; return 'studio://report'; });
    const hostAddress = crashReportUrl(error, { surface: 'The preview', template: 'StorefrontShell' }, stack);

    it('should open the issue form by default with the title filled in', () => defaultAddress.should.contain('title=The%20preview%20crashed'));
    it('should say what failed in the body', () => decodeURIComponent(defaultAddress).should.contain('Component: IndicatorButton'));
    it('should never put a secret in the address', () => defaultAddress.should.not.contain('hidden123'));
    it('should hand the host the summary and the full technical detail', () => { hostAddress.should.equal('studio://report'); request!.details.should.contain('Component stack:'); request!.summary.should.contain('Template: StorefrontShell'); });
    it('should read the component out of the first line of the stack', () => componentOfStack(stack)!.should.equal('IndicatorButton'));
    it('should read none from an empty stack', () => (componentOfStack('') === undefined).should.be.true);
});
