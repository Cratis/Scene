// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidthUnit } from '@cratis/scene.model';
import { CommandFormLayoutDiagnosticCode } from '../forms/CommandFormLayoutDiagnosticCode';
import { validateCommandFormLayout } from '../forms/validateCommandFormLayout';

describe('when validating geometry', () => {
    it('should accept unequal typed columns and field spans', () => {
        const layout: CommandFormLayout = {
            columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 2 } }, { index: 2, width: { unit: FormWidthUnit.Pixels, value: 360 } }],
            placements: [{ field: 'amount', row: 1, column: 1, columnSpan: 2 }],
        };

        validateCommandFormLayout(layout, ['amount']).should.be.empty;
    });

    it('should reject duplicate columns unknown fields and out of bounds placements', () => {
        const diagnostics = validateCommandFormLayout({
            columns: [{ index: 1 }, { index: 1 }],
            placements: [{ field: 'missing', row: 1, column: 2, columnSpan: 2 }],
        }, ['amount']);

        diagnostics.map(diagnostic => diagnostic.code).should.have.members([
            CommandFormLayoutDiagnosticCode.DuplicateColumn,
            CommandFormLayoutDiagnosticCode.MissingField,
            CommandFormLayoutDiagnosticCode.OutOfBoundsPlacement,
        ]);
    });
});
