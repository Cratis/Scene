// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout } from '@cratis/scene.model';
import { CommandFormLayoutKey } from '../CommandFormLayoutKey';
import { applyCommandFormLayoutKey } from '../applyCommandFormLayoutKey';

describe('when arranging fields from the keyboard', () => {
    const layout: CommandFormLayout = {
        columns: [{ index: 1 }, { index: 2 }],
        placements: [{ field: 'name', row: 1, column: 1 }, { field: 'notes', row: 2, column: 1, rowSpan: 2 }],
    };
    const fields = ['name', 'notes'];
    const placementOf = (key: CommandFormLayoutKey, resize = false, field = 'name') =>
        applyCommandFormLayoutKey(layout, field, key, resize, fields)!.draft.placements.find(placement => placement.field === field);

    it('should move a field one cell with each arrow key', () => {
        placementOf(CommandFormLayoutKey.ArrowRight)!.should.deep.include({ row: 1, column: 2 });
        placementOf(CommandFormLayoutKey.ArrowDown)!.should.deep.include({ row: 2, column: 1 });
    });

    it('should not move a field before the first row or column', () => {
        placementOf(CommandFormLayoutKey.ArrowLeft)!.should.deep.include({ row: 1, column: 1 });
        placementOf(CommandFormLayoutKey.ArrowUp)!.should.deep.include({ row: 1, column: 1 });
    });

    it('should resize spans with shift and never below one', () => {
        placementOf(CommandFormLayoutKey.ArrowRight, true)!.columnSpan!.should.equal(2);
        placementOf(CommandFormLayoutKey.ArrowLeft, true)!.columnSpan!.should.equal(1);
        placementOf(CommandFormLayoutKey.ArrowUp, true, 'notes')!.rowSpan!.should.equal(1);
        placementOf(CommandFormLayoutKey.ArrowDown, true, 'notes')!.rowSpan!.should.equal(3);
    });

    it('should report a move past the last column and keep the committed layout', () => {
        const moved = applyCommandFormLayoutKey(applyCommandFormLayoutKey(layout, 'name', CommandFormLayoutKey.ArrowRight, false, fields)!.draft, 'name', CommandFormLayoutKey.ArrowRight, false, fields)!;
        moved.isValid.should.equal(false);
        moved.diagnostics.map(diagnostic => diagnostic.code).should.include('outOfBoundsPlacement');
        moved.committed.placements.find(placement => placement.field === 'name')!.column.should.equal(2);
    });

    it('should ignore a field that is not placed', () => (applyCommandFormLayoutKey(layout, 'missing', CommandFormLayoutKey.ArrowDown) === undefined).should.equal(true));
});
