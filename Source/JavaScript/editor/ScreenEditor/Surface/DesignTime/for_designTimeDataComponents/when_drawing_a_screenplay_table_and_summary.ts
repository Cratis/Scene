// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { componentRegistryKey, type ComponentRegistry, type RegisteredComponentProps } from '@cratis/scene.react';
import { designTimeDataComponents } from '../designTimeDataComponents';

const own = (props: RegisteredComponentProps) => createElement('span', { 'data-own': props.element.id });
const registry = designTimeDataComponents({ 'core:table': own, 'core:summary': own } as unknown as ComponentRegistry);
const child = (property: string, label: string) => ({ id: property, properties: { property, label } });
const draw = (key: string, element: object) => renderToStaticMarkup(createElement(registry[key] as ComponentType<RegisteredComponentProps>, { element, slots: {} } as unknown as RegisteredComponentProps));

describe('when drawing a table of a screenplay', () => {
    const markup = draw('core:table', { id: 'orders', slots: { columns: [child('orderId', 'Order'), child('quotedTotal', 'Total')] } });

    it('should draw the headings the screen says', () => { markup.should.contain('>Order</th>'); markup.should.contain('>Total</th>'); });
    it('should draw sample rows under them', () => (markup.match(/<tr role="row">/g) ?? []).length.should.equal(4));
    it('should draw a value fitted to the property', () => markup.should.contain('<td>49.00</td>'));
});

describe('when drawing a table that has no columns of a screenplay', () => {
    it('should leave it to the profile\'s own drawing', () => draw('core:table', { id: 'dropped', slots: {} }).should.contain('data-own="dropped"'));
});

describe('when drawing a summary of a screenplay', () => {
    const markup = draw('core:summary', { id: 'basket', slots: { fields: [child('lineCount', 'Lines'), child('status', 'Status')] } });

    it('should draw each field with its label and a sample value', () => { markup.should.contain('<dt>Lines</dt>'); markup.should.contain('<dd>3</dd>'); markup.should.contain('<dt>Status</dt>'); markup.should.contain('<dd>Draft</dd>'); });
});

describe('when drawing the fields of a command form at design time', () => {
    const summary = designTimeDataComponents({})[componentRegistryKey('core', 'summary')];
    const element = { id: 'form-fields', name: 'Fields', componentName: 'core:summary', properties: { form: true, layout: { columns: [{ index: 1, width: { unit: 'fraction', value: 1 } }, { index: 2, width: { unit: 'fraction', value: 1 } }] } }, slots: { fields: [{ properties: { property: 'sku', label: 'SKU' } }] } };
    const markup = renderToStaticMarkup(createElement(summary, { element: element as never, slots: {} }));

    it('should draw each field as an input', () => markup.should.contain('<input'));
    it('should keep the label', () => markup.should.contain('SKU'));
    it('should lay the fields out in the form\'s columns', () => markup.should.contain('grid-template-columns:minmax(0, 1fr) minmax(0, 1fr)'));
});
