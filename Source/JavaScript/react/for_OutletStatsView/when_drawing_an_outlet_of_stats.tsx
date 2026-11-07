// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { ExternalComponent, OutletItemKind } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';
import { queryFieldValue, trendDirection } from '../outlets/OutletStatsView';

const stats = {
    id: 'stats', componentName: 'core:outletItems', slots: {},
    properties: {
        name: 'stats', kind: 'stats', items: [
            { kind: OutletItemKind.Stat, id: 'total', title: 'Products', valueFrom: { query: 'ProductStats', field: 'total' }, trend: { query: 'ProductStats', field: 'change' } },
            { kind: OutletItemKind.Stat, id: 'drafts', title: 'Drafts', valueFrom: { query: 'ProductStats', field: 'drafts' } },
            { kind: OutletItemKind.Stat, id: 'orders', title: 'Orders', valueFrom: { query: 'OrderStats', field: 'open' } },
        ],
    },
} as unknown as ExternalComponent;

const text = (selector: string) => Array.from(document.querySelectorAll(selector)).map(node => node.textContent);

describe('when drawing an outlet of stats', () => {
    afterEach(cleanup);

    beforeEach(() => {
        render(<SceneElementView element={stats as never} registry={coreComponents} queryResults={{ ProductStats: { total: 128, drafts: 9, change: -3 } }} />);
    });

    it('should draw each stat\'s label', () => text('.scene-outlet-stat-label').should.deep.equal(['Products', 'Drafts', 'Orders']));
    it('should draw each value from its field of a single-result query, and a dash while a query has no result', () =>
        text('.scene-outlet-stat-value').should.deep.equal(['128', '9', '–']));
    it('should draw the trend with its direction', () =>
        [text('.scene-outlet-stat-trend'), document.querySelector('.scene-outlet-stat-trend')!.getAttribute('data-scene-trend')].should.deep.equal([['-3'], 'down']));

    describe('and a query returned a list', () => {
        it('should read the first row', () => (queryFieldValue({ Stats: [{ total: 4 }, { total: 5 }] }, { query: 'Stats', field: 'total' }) as number).should.equal(4));
    });

    describe('and a trend is read', () => {
        it('should point up, down or flat', () => [trendDirection(2), trendDirection('-1'), trendDirection(0), trendDirection('x')].should.deep.equal(['up', 'down', 'flat', 'flat']));
    });
});
