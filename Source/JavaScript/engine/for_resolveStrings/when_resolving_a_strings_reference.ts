// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Control, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { isStringsReference, resolveStringsInElement, resolveStringsValue } from '../index';

const dictionary = {
    'invoice.title': 'Invoices',
    'invoice.number': 'Invoice #',
};

function control(id: string): Control {
    return {
        id,
        name: id,
        properties: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 },
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        tabIndex: 0,
    };
}

function externalComponent(id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, ExternalComponent[]> = {}): ExternalComponent {
    return { ...control(id), componentName, properties, slots };
}

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
        (resolveStringsValue('$strings.invoice.title', dictionary) as string).should.equal('Invoices');
    });

    it('should leave a reference missing from the dictionary as its literal token', () => {
        (resolveStringsValue('$strings.invoice.missing', dictionary) as string).should.equal('$strings.invoice.missing');
    });

    it('should pass a non-reference value through unchanged', () => {
        (resolveStringsValue(42, dictionary) as number).should.equal(42);
    });
});

describe('when resolving references nested inside an external component tree', () => {
    const title = externalComponent('title', 'core:title', { text: '$strings.invoice.title' });
    const table = externalComponent('table', 'core:table', {}, {
        columns: [externalComponent('column', 'core:column', { label: '$strings.invoice.number' })],
    });

    const resolvedTitle = resolveStringsInElement(title, dictionary) as ExternalComponent;
    const resolvedTable = resolveStringsInElement(table, dictionary) as ExternalComponent;

    it('should resolve a reference at the top of the tree', () => {
        (resolvedTitle.properties.text as string).should.equal('Invoices');
    });

    it('should leave the original element untouched', () => {
        (title.properties.text as string).should.equal('$strings.invoice.title');
    });

    it('should resolve a reference nested inside a slot', () => {
        (resolvedTable.slots.columns[0].properties.label as string).should.equal('Invoice #');
    });
});
