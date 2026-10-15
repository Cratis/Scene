// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import sinon from 'sinon';
import { afterEach } from 'vitest';
import { ComponentState, EmptyState, foundationElement } from '../foundation';
import { renderFoundation, violationsIn } from './given';

// Spec Part B 1.5: localization, right to left, locale-aware numbers, and an enabled/disabled/hidden rule on every action control.
describe('when applying the cross-cutting rules of the foundation components', () => {
    afterEach(cleanup);

    it('should take every text the component says itself from the strings property', () => {
        renderFoundation('statCard', { label: 'Pipeline', value: 1, error: 'x', strings: { retry: 'Reessayer', errorHeadline: 'Echec' } }, ComponentState.Error);
        screen.getByRole('button', { name: 'Reessayer' });
        screen.getByText('Echec');
    });

    it('should ignore a text override it does not know, falling back to the default', () => {
        renderFoundation('statCard', { label: 'Pipeline', error: 'x', strings: { retri: 'Nope', retry: 7 } }, ComponentState.Error);
        screen.getByRole('button', { name: 'Try again' });
    });

    it('should format numbers and currency for the locale of the element', () => {
        const german = renderFoundation('statCard', { label: 'Pipeline', value: 1234567.5, format: 'currency', currency: 'EUR', locale: 'de-DE' });
        german.container.querySelector('.foundation-stat-value')!.textContent!.replace(/\u00a0/g, ' ').should.equal('1.234.567,50 €');
        cleanup();
        const compact = renderFoundation('statCard', { label: 'Pipeline', value: 1234567, format: 'compact', locale: 'en-US' });
        compact.container.querySelector('.foundation-stat-value')!.textContent!.should.equal('1.2M');
    });

    it('should leave a right-to-left page without accessibility violations and mark the region with its locale', async () => {
        const { container } = renderFoundation('statCard', { label: 'خط الأنابيب', value: 1234, locale: 'ar-EG', change: 4 }, undefined,
            children => <div dir='rtl'>{children}</div>);
        container.querySelector('section')!.getAttribute('lang')!.should.equal('ar-EG');
        (await violationsIn(container)).should.deep.equal([]);
    });

    it('should work an enabled action', () => {
        renderFoundation('emptyState', { headline: 'No leads', actionLabel: 'New lead', actionPermission: 'enabled' });
        (screen.getByRole('button', { name: 'New lead' }).getAttribute('aria-disabled') === null).should.equal(true);
    });

    it('should refuse a disabled action and say why, without running it', () => {
        const run = sinon.spy();
        const { container } = render(<EmptyState element={foundationElement('emptyState', { headline: 'No leads', actionLabel: 'New lead', actionPermission: 'disabled' })}
            slots={{}} interactions={{ onClick: run }} />);
        const button = screen.getByRole('button', { name: /New lead/ });
        button.getAttribute('aria-disabled')!.should.equal('true');
        button.getAttribute('title')!.should.equal('You do not have permission to do this');
        fireEvent.click(button);
        run.callCount.should.equal(0);
        container.textContent!.should.contain('You do not have permission to do this');
    });

    it('should not render a hidden action', () => {
        renderFoundation('emptyState', { headline: 'No leads', actionLabel: 'New lead', actionPermission: 'hidden' });
        (screen.queryByRole('button') === null).should.equal(true);
    });

    it('should run the behaviors attached to the element when an enabled action is pressed', () => {
        const run = sinon.spy();
        render(<EmptyState element={foundationElement('emptyState', { headline: 'No leads', actionLabel: 'New lead' })} slots={{}} interactions={{ onClick: run }} />);
        fireEvent.click(screen.getByRole('button', { name: 'New lead' }));
        run.callCount.should.equal(1);
    });
});
