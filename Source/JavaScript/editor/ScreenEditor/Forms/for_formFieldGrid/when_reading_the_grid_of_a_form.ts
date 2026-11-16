// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formFieldGridOf } from '../formFieldGrid';

describe('when reading the grid of a form', () => {
    const layout = {
        columns: [{ index: 2, width: { unit: 'pixels', value: 200 } }, { index: 1, width: { unit: 'fraction', value: 1 } }],
        placements: [{ field: 'details', row: 1, column: 1, columnSpan: 2 }, { field: 'imageUrl', row: 2, column: 2 }],
        columnGap: { unit: 'pixels', value: 24 },
    };
    const grid = formFieldGridOf(layout);

    it('should lay the columns out in their order', () => grid.columns.should.equal('minmax(0, 1fr) minmax(0, 200px)'));
    it('should keep the gap between them', () => grid.gap!.should.equal('24px'));
    it('should place a field on its row', () => grid.placements.details.gridRow!.should.equal('1'));
    it('should span a field over its columns', () => grid.placements.details.gridColumn!.should.equal('1 / span 2'));
    it('should place a field in its column', () => grid.placements.imageUrl.gridColumn!.should.equal('2 / span 1'));
});

describe('when reading the grid of a form with no layout', () => {
    const grid = formFieldGridOf(undefined);

    it('should put one field under the other', () => grid.columns.should.equal('1fr'));
    it('should place nothing', () => Object.keys(grid.placements).should.be.empty);
});
