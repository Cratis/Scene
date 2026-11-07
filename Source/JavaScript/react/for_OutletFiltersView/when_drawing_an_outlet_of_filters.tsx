// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ExternalComponent, FilterControl, OutletItemKind } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';
import { SceneOutletsProvider } from '../outlets/SceneOutletsContext';
import { SceneRouterProvider, useSceneQueryParameters } from '../routing';
import { rangeBounds, rangeValue } from '../outlets/OutletFiltersView';

const filters = {
    id: 'filters', componentName: 'core:outletItems', slots: {},
    properties: {
        name: 'filters', kind: 'filters', items: [
            { kind: OutletItemKind.Filter, id: 'search', title: 'Search', control: FilterControl.Search, sets: { query: 'AllProducts', parameter: 'q' } },
            { kind: OutletItemKind.Filter, id: 'status', title: 'Status', control: FilterControl.Choice, sets: { query: 'AllProducts', parameter: 'status' } },
            { kind: OutletItemKind.Filter, id: 'price', title: 'Price', control: FilterControl.Range, sets: { query: 'AllProducts', parameter: 'price' } },
            { kind: OutletItemKind.Filter, id: 'since', title: 'Since', control: FilterControl.Date },
        ],
    },
} as unknown as ExternalComponent;

function Parameters() {
    return <output data-testid='parameters'>{JSON.stringify(useSceneQueryParameters())}</output>;
}

const parameters = () => JSON.parse(screen.getByTestId('parameters').textContent!) as Record<string, string>;

describe('when drawing an outlet of filters', () => {
    afterEach(cleanup);

    beforeEach(() => {
        render(<SceneRouterProvider>
            <SceneOutletsProvider value={{ chain: [], filterChoices: { status: [{ value: 'onSale', label: 'On sale' }, { value: 'draft', label: 'Draft' }] } }}>
                <SceneElementView element={filters as never} registry={coreComponents} />
            </SceneOutletsProvider>
            <Parameters />
        </SceneRouterProvider>);
    });

    it('should draw a control per filter, chosen by its control', () =>
        Array.from(document.querySelectorAll('[data-scene-filter-control]')).map(node => node.getAttribute('data-scene-filter-control')).should.deep.equal(['search', 'choice', 'range', 'date']));

    describe('and the search, a choice, a range and a date are set', () => {
        beforeEach(() => {
            fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'kettle' } });
            fireEvent.click(screen.getByRole('button', { name: 'On sale' }));
            fireEvent.change(screen.getByLabelText('Price from'), { target: { value: '100' } });
            fireEvent.change(document.querySelector('input[type="date"]')!, { target: { value: '2026-01-31' } });
        });

        it('should write each value to the query parameter the filter sets, or one named after the filter', () =>
            parameters().should.deep.equal({ q: 'kettle', status: 'onSale', price: '100..', since: '2026-01-31' }));
        it('should mark the chosen choice', () => screen.getByRole('button', { name: 'On sale' }).getAttribute('aria-pressed')!.should.equal('true'));

        describe('and the choice is chosen again and the search cleared', () => {
            beforeEach(() => {
                fireEvent.click(screen.getByRole('button', { name: 'On sale' }));
                fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
            });

            it('should remove their parameters', () => parameters().should.deep.equal({ price: '100..', since: '2026-01-31' }));
        });
    });

    describe('and a range is read back', () => {
        it('should split it at the separator', () => [rangeBounds('100..500'), rangeBounds('..500'), rangeBounds(undefined)].should.deep.equal([['100', '500'], ['', '500'], ['', '']]));
        it('should write nothing for two empty bounds', () => (rangeValue('', '') === undefined).should.be.true);
    });
});
