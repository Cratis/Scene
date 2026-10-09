// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidthUnit } from '@cratis/scene.model';
import { commitCommandFormLayoutDraft, preserveDirtyCommandValues, resizeCommandFormColumn, updateCommandFormFieldPlacement } from '../forms';

describe('when editing geometry', () => {
    const committed: CommandFormLayout = {
        columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 1 } }, { index: 2, width: { unit: FormWidthUnit.Fraction, value: 1 } }],
        placements: [{ field: 'name', row: 1, column: 1 }],
    };

    it('should keep invalid draft placement separate from committed metadata', () => {
        const draft = updateCommandFormFieldPlacement(committed, { field: 'name', row: 1, column: 3 }, ['name']);

        draft.isValid.should.be.false;
        commitCommandFormLayoutDraft(draft).should.equal(committed);
        draft.draft.placements[0].column.should.equal(3);
    });

    it('should commit valid resize operations', () => {
        const draft = resizeCommandFormColumn(committed, 2, { unit: FormWidthUnit.Pixels, value: 420 }, ['name']);

        draft.isValid.should.be.true;
        commitCommandFormLayoutDraft(draft).columns[1].width!.value!.should.equal(420);
    });

    it('should preserve dirty values during refresh', () => {
        const merged = preserveDirtyCommandValues({ name: 'Unsaved', amount: 10 }, { name: 'Server', amount: 12 }, new Set(['name']));

        merged.should.deep.equal({ name: 'Unsaved', amount: 12 });
    });
});
