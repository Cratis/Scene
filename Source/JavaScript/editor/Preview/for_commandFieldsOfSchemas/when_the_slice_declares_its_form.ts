// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import { commandFieldsOfSchemas } from '../commandFieldsOfSchemas';

const schema = JSON.stringify({
    type: 'object',
    required: ['productId', 'sku', 'name', 'category'],
    properties: {
        productId: { type: 'string', format: 'uuid', 'x-generated': true },
        sku: { type: 'string' },
        name: { type: 'string' },
        category: { type: 'string' },
    },
});
const slice = 'Merchandising.Products.DraftProduct';
const screen = (owner: string) => ({
    name: 'NewProduct', layout: 'Shell', slotContent: {}, contributions: [], owner,
    forms: [{ name: 'DraftProductForm', forCommand: 'DraftProduct', fields: [{ name: 'name', label: 'Product' }, { name: 'sku', label: 'SKU' }, { name: 'category', label: 'Category' }] }],
}) as unknown as Screen;

describe('when the slice a dialog is opened for declares the form of its command', () => {
    const fields = commandFieldsOfSchemas({ DraftProduct: schema }, [screen(slice)])('DraftProduct', slice);

    it('should ask for the form\'s fields in the form\'s order', () => fields.map(field => field.name).should.deep.equal(['name', 'sku', 'category']));
    it('should label them as the form does', () => fields.map(field => field.label).should.deep.equal(['Product', 'SKU', 'Category']));
    it('should keep what the schema says of each', () => fields.every(field => field.required && field.type === 'string').should.be.true);
});

describe('when the slice declares no form', () => {
    const fields = commandFieldsOfSchemas({ DraftProduct: schema }, [])('DraftProduct', slice);

    it('should ask for the command\'s fields', () => fields.map(field => field.name).should.deep.equal(['sku', 'name', 'category']));
    it('should never ask for the identifier the command generates', () => fields.some(field => field.name === 'productId').should.be.false);
});
