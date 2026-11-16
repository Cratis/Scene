// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeCrash, type CrashEnvironment } from '../crashReport';

describe('when describing a crash', () => {
    const environment: CrashEnvironment = {
        href: 'https://studio.example/projects/p1/application/a1?token=abc123def456&view=preview#frag',
        userAgent: 'TestBrowser/1.0',
        time: new Date('2026-10-20T06:00:00Z'),
        version: '0.252.0',
    };
    const error = new Error('Cannot read properties of undefined (reading "bar") for Bearer abcdefghijklmnop');
    const componentStack = '\n    at IndicatorButton (https://studio.example/assets/a.js:1:1)\n    at Shell (https://studio.example/assets/a.js:1:2)';
    const detail = describeCrash(error, { surface: 'The preview', template: 'StorefrontShell', screen: 'Basket', details: { Target: 'Shop.Basket', Empty: undefined } }, componentStack, environment);

    it('should say what stopped', () => detail.should.contain('Surface: The preview'));
    it('should name the component that threw from the component stack', () => detail.should.contain('Component: IndicatorButton'));
    it('should name the template', () => detail.should.contain('Template: StorefrontShell'));
    it('should name the screen', () => detail.should.contain('Screen: Basket'));
    it('should carry the extra details that have a value', () => detail.should.contain('Target: Shop.Basket'));
    it('should leave out the details that have none', () => detail.should.not.contain('Empty:'));
    it('should carry the error text', () => detail.should.contain('Error: Error: Cannot read properties of undefined'));
    it('should carry the component stack', () => detail.should.contain('Component stack:'));
    it('should carry the time and the Studio version', () => { detail.should.contain('2026-10-20T06:00:00.000Z'); detail.should.contain('Studio: 0.252.0'); });
    it('should not carry the query string or fragment of the page', () => { detail.should.contain('Page: https://studio.example/projects/p1/application/a1\n'); detail.should.not.contain('abc123def456'); });
    it('should not carry a bearer token', () => { detail.should.not.contain('abcdefghijklmnop'); detail.should.contain('Bearer [redacted]'); });
});
