// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Form } from '@cratis/scene.model';
import { classifyFormFields } from '../classifyFormFields';
import { FieldMapping } from '../FieldMapping';
import { FieldMappingKind } from '../FieldMappingKind';

describe('when classifying fields', () => {
    let result: FieldMapping[];

    beforeEach(() => {
        const form: Form = {
            name: 'RegisterInvoiceForm',
            forCommand: 'RegisterInvoice',
            fields: [
                { name: 'invoiceNumber' },
                { name: 'customerName', sourceProperty: 'customer' },
                { name: 'total', composeUsing: 'ComputeTotal' },
                { name: 'discount', sourceProperty: 'promoCode' },
                { name: 'notes' },
                { name: 'invoiceNumber', sourceProperty: 'invoiceNumber' },
            ],
        };

        result = classifyFormFields(form, ['invoiceNumber', 'customer']);
    });

    it('should classify a field with no sourceProperty or composeUsing that matches a command property as auto-mapped', () => {
        result[0].kind.should.equal(FieldMappingKind.AutoMapped);
    });

    it('should classify a field with a sourceProperty that matches a command property as renamed', () => {
        result[1].kind.should.equal(FieldMappingKind.Renamed);
    });

    it('should classify a field with composeUsing as composed regardless of command properties', () => {
        result[2].kind.should.equal(FieldMappingKind.Composed);
    });

    it('should classify a field whose sourceProperty does not exist on the command as broken', () => {
        result[3].kind.should.equal(FieldMappingKind.Broken);
    });

    it('should classify an auto-mapped field whose own name does not exist on the command as broken', () => {
        result[4].kind.should.equal(FieldMappingKind.Broken);
    });

    it('should classify a field that names the property of its own name as auto-mapped', () => {
        result[5].kind.should.equal(FieldMappingKind.AutoMapped);
    });

    it('should carry the original field on every mapping', () => {
        result[0].field.name.should.equal('invoiceNumber');
    });
});
