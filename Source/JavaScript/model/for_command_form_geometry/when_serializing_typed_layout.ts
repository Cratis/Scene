// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Form, FormGenerationMode, FormWidthUnit } from '../forms';

describe('when serializing typed layout', () => {
    it('should keep generation mode separate from geometry and preserve composeUsing', () => {
        const form: Form = {
            name: 'Register invoice',
            forCommand: 'RegisterInvoice',
            generationMode: FormGenerationMode.Manual,
            layout: {
                columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 2 } }, { index: 2, width: { unit: FormWidthUnit.Pixels, value: 320 } }],
                placements: [{ field: 'amount', row: 1, column: 2, columnSpan: 1, width: { unit: FormWidthUnit.Percent, value: 100 } }],
            },
            fields: [{ name: 'amount', composeUsing: 'calculateAmount' }],
        };

        const roundTripped = JSON.parse(JSON.stringify(form)) as Form;

        roundTripped.generationMode!.should.equal(FormGenerationMode.Manual);
        roundTripped.layout!.columns[0].width!.unit.should.equal(FormWidthUnit.Fraction);
        roundTripped.layout!.placements[0].width!.unit.should.equal(FormWidthUnit.Percent);
        roundTripped.fields[0].composeUsing!.should.equal('calculateAmount');
    });
});
