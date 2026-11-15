// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, FormWidthUnit, type Form } from '@cratis/scene.model';
import { formWithLayout, updateFieldPlacement } from '../commandFormLayout';

const fields = ['a', 'b', 'c'].map(name => ({ name }));
const manual: Form = { name: 'F', forCommand: 'F', generationMode: FormGenerationMode.Manual, fields };

describe('when laying out a form that has no layout yet', () => {
    const laid = formWithLayout(manual);

    it('should number the columns from one, as Scene and Screenplay do', () => laid.layout!.columns.map(column => column.index).should.deep.equal([1, 2]));
    it('should place the first field at row one, column one', () => laid.layout!.placements[0].should.include({ row: 1, column: 1 }));
    it('should place the third field at row two, column one', () => laid.layout!.placements[2].should.include({ row: 2, column: 1 }));
    it('should never move a field before row one, column one', () => updateFieldPlacement(laid, 'a', placement => ({ ...placement, row: -4, column: 0 })).layout!.placements[0].should.include({ row: 1, column: 1 }));
});

describe('when laying out a form saved with columns and rows numbered from zero', () => {
    const legacy: Form = {
        ...manual,
        layout: {
            columns: [{ index: 0, width: { unit: FormWidthUnit.Fraction, value: 2 } }, { index: 1, width: { unit: FormWidthUnit.Pixels, value: 240 } }],
            placements: [{ field: 'a', row: 0, column: 0, rowSpan: 1, columnSpan: 1 }, { field: 'b', row: 0, column: 1, rowSpan: 1, columnSpan: 1 }, { field: 'c', row: 3, column: 0, rowSpan: 1, columnSpan: 2 }],
            columnGap: { unit: FormWidthUnit.Pixels, value: 24 },
        },
    };
    const laid = formWithLayout(legacy);

    it('should read the columns as the same grid, one further along', () => laid.layout!.columns.map(column => `${column.index}:${column.width!.value}`).should.deep.equal(['1:2', '2:240']));
    it('should read the placements one row and column further along', () => laid.layout!.placements.map(placement => `${placement.field}:${placement.row}:${placement.column}:${placement.columnSpan}`).should.deep.equal(['a:1:1:1', 'b:1:2:1', 'c:4:1:2']));
    it('should carry the placements onto the fields', () => laid.fields[2].placement!.should.include({ row: 4, column: 1 }));
    it('should keep the gaps', () => laid.layout!.columnGap!.should.deep.equal({ unit: FormWidthUnit.Pixels, value: 24 }));
    it('should leave an already numbered form as it is', () => formWithLayout(laid).layout!.columns.map(column => column.index).should.deep.equal([1, 2]));
});
