// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidthUnit } from '@cratis/scene.model';
import { stackCommandFormLayout } from '../stackCommandFormLayout';
import { validateCommandFormLayout } from '../validateCommandFormLayout';

describe('when stacking a command form layout at a compact width', () => {
    const layout: CommandFormLayout = {
        columns: [{ index: 1, width: { unit: FormWidthUnit.Pixels, value: 240 } }, { index: 2 }],
        placements: [
            { field: 'notes', row: 2, column: 1, columnSpan: 2, width: { unit: FormWidthUnit.Percent, value: 100 } },
            { field: 'name', row: 1, column: 2 },
            { field: 'id', row: 1, column: 1 },
        ],
        columnGap: { unit: FormWidthUnit.Pixels, value: 12 },
    };
    const original = JSON.stringify(layout);
    const stacked = stackCommandFormLayout(layout);

    it('should use one full-width column', () => stacked.columns.should.deep.equal([{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 1 } }]));
    it('should place every field on its own row in reading order', () =>
        stacked.placements.should.deep.equal([{ field: 'id', row: 1, column: 1 }, { field: 'name', row: 2, column: 1 }, { field: 'notes', row: 3, column: 1 }]));
    it('should keep the gaps', () => stacked.columnGap!.should.deep.equal(layout.columnGap));
    it('should produce a valid layout', () => validateCommandFormLayout(stacked, ['id', 'name', 'notes']).should.deep.equal([]));
    it('should not change the authored layout', () => JSON.stringify(layout).should.equal(original));
});
