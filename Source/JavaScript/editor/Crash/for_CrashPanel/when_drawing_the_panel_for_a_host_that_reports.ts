// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CrashPanel } from '../CrashPanel';
import { CrashReporterProvider } from '../CrashReporter';

const draw = (reports: boolean, layout?: 'fixed' | 'fill') => {
    const panel = createElement(CrashPanel, {
        error: new Error('bar is undefined'),
        componentStack: '\n    at IndicatorButton (a.js:1:1)',
        context: { surface: 'The event model board' },
        onRecover: () => undefined,
        ...(layout ? { layout } : {}),
    });
    return renderToStaticMarkup(reports ? createElement(CrashReporterProvider, { value: () => undefined }, panel) : panel);
};

describe('when drawing the panel for a host that reports crashes itself', () => {
    const markup = draw(true);

    it('should stay in the box it guards instead of covering the page', () => {
        markup.should.not.contain('studio-crash--fixed');
        markup.should.contain('studio-crash--fill');
    });
    it('should be small', () => markup.should.contain('studio-crash--compact'));
    it('should say that the report form is open', () => markup.should.contain('The report form is open'));
    it('should still name what stopped and the error', () => { markup.should.contain('The event model board stopped'); markup.should.contain('bar is undefined'); });
    it('should leave the technical detail to the report form', () => { markup.should.not.contain('Technical detail'); markup.should.not.contain('Component stack:'); });
    it('should still offer to report it again, try again and reload', () => {
        markup.should.contain('data-crash-action="report"');
        markup.should.contain('data-crash-action="retry"');
        markup.should.contain('data-crash-action="reload"');
    });

    const withoutHost = draw(false);
    it('should cover the page when no host reports', () => { withoutHost.should.contain('studio-crash--fixed'); withoutHost.should.not.contain('studio-crash--compact'); });
    it('should keep a fill layout a host asked for', () => draw(true, 'fill').should.contain('studio-crash--fill'));
});
