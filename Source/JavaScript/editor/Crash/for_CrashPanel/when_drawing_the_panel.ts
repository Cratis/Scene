// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CrashPanel } from '../CrashPanel';

const draw = (props: { onRecover?: () => void; onClose?: () => void } = {}) => renderToStaticMarkup(createElement(CrashPanel, {
    error: new Error('bar is undefined'),
    componentStack: '\n    at IndicatorButton (a.js:1:1)',
    context: { surface: 'The preview', template: 'StorefrontShell', screen: 'Basket' },
    ...props,
}));

describe('when drawing the crash panel', () => {
    const markup = draw({ onRecover: () => undefined, onClose: () => undefined });

    it('should be an alert, so it is announced', () => markup.should.contain('role="alert"'));
    it('should say what stopped', () => markup.should.contain('The preview stopped'));
    it('should name the component that threw', () => markup.should.contain('>IndicatorButton<'));
    it('should name the template and the screen', () => { markup.should.contain('>StorefrontShell<'); markup.should.contain('>Basket<'); });
    it('should show the error text', () => markup.should.contain('bar is undefined'));
    it('should offer Reload', () => markup.should.contain('data-crash-action="reload"'));
    it('should offer to report the error', () => markup.should.contain('Report this error'));
    it('should offer Try again and Close when the host can do them', () => { markup.should.contain('data-crash-action="retry"'); markup.should.contain('data-crash-action="close"'); });
    it('should carry the technical detail', () => markup.should.contain('Component stack:'));

    const minimal = draw();
    it('should offer neither Try again nor Close when the host cannot do them', () => { minimal.should.not.contain('data-crash-action="retry"'); minimal.should.not.contain('data-crash-action="close"'); });
});
