// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { isStringsReference, resolveStringsInElement, resolveStringsValue } from '../index';

const dictionary = {
    'invoice.title': 'Invoices',
    'invoice.number': 'Invoice #',
};

describe('when telling a strings reference apart from a literal value', () => {
    it('should recognize a $strings. reference', () => {
        isStringsReference('$strings.invoice.title').should.be.true;
    });

    it('should reject a literal value', () => {
        isStringsReference('Invoices').should.be.false;
    });

    it('should reject a non-string value', () => {
        isStringsReference(42).should.be.false;
    });
});

describe('when resolving a single property value', () => {
    it('should resolve a reference present in the dictionary', () => {
        resolveStringsValue('$strings.invoice.title', dictionary).should.equal('Invoices');
    });

    it('should leave a reference missing from the dictionary as its literal token', () => {
        resolveStringsValue('$strings.invoice.missing', dictionary).should.equal('$strings.invoice.missing');
    });

    it('should pass a non-reference value through unchanged', () => {
        resolveStringsValue(42, dictionary).should.equal(42);
    });
});

describe('when resolving references nested inside an external component tree', () => {
    const title: ExternalComponent = {
        id: 'title',
        componentName: 'core:title',
        properties: { text: '$strings.invoice.title' },
        slots: {},
    };
    const table: ExternalComponent = {
        id: 'table',
        componentName: 'core:table',
        properties: {},
        slots: {
            columns: [
                {
                    id: 'column',
                    componentName: 'core:column',
                    properties: { label: '$strings.invoice.number' },
                    slots: {},
                } as ExternalComponent,
            ],
        },
    };

    const resolvedTitle = resolveStringsInElement(title, dictionary) as ExternalComponent;
    const resolvedTable = resolveStringsInElement(table, dictionary) as ExternalComponent;

    it('should resolve a reference at the top of the tree', () => {
        resolvedTitle.properties.text!.should.equal('Invoices');
    });

    it('should leave the original element untouched', () => {
        title.properties.text!.should.equal('$strings.invoice.title');
    });

    it('should resolve a reference nested inside a slot', () => {
        resolvedTable.slots.columns[0].properties.label!.should.equal('Invoice #');
    });
});
