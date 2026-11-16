// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SliceCommandFieldsProvider, componentRegistryKey } from '@cratis/scene.react';
import { previewActionComponents } from '../previewActionComponents';
import { an_action } from './given/an_action';

const form = previewActionComponents[componentRegistryKey('Cratis.Components', 'commandForm')];
const element = { ...an_action, id: 'approve-form', componentName: 'Cratis.Components:commandForm', properties: { command: 'ApproveOrder', exclude: ['note'] } };
const fields = (command: string) => command === 'ApproveOrder'
    ? [{ name: 'orderId', type: 'string', label: 'Order Id', required: true, initialValue: 'ORD-1' }, { name: 'note', type: 'string' }, { name: 'express', type: 'boolean', initialValue: true }]
    : [];
const draw = (properties = element.properties) => renderToStaticMarkup(createElement(SliceCommandFieldsProvider, { fieldsFor: fields }, createElement(form, { element: { ...element, properties }, slots: {} })));

describe('when drawing a command form in a preview', () => {
    const markup = draw();

    it('should draw the fields of the command', () => markup.should.contain('Order Id *'));
    it('should start a field with its sample value', () => markup.should.contain('value="ORD-1"'));
    it('should draw a boolean as a checkbox', () => markup.should.contain('type="checkbox"'));
    it('should leave out an excluded field', () => markup.should.not.contain('name="note"'));
    it('should draw the submit button with the humanized command', () => markup.should.contain('>Approve order</button>'));
    it('should draw the fields one under the other', () => markup.should.contain('grid-template-columns:1fr'));
    it('should not draw an unresolved binding', () => markup.should.not.contain('Unresolved'));
    it('should name the command it draws', () => markup.should.contain('data-preview-command-form="ApproveOrder"'));
});

describe('when drawing a command form with a submit label', () => {
    it('should draw the label', () => draw({ command: 'ApproveOrder', submitLabel: 'Approve it' } as never).should.contain('>Approve it</button>'));
});

describe('when drawing a command form for a command the application does not describe', () => {
    const markup = draw({ command: 'Unknown' } as never);

    it('should still draw the submit button', () => markup.should.contain('>Unknown</button>'));
    it('should draw no field', () => markup.should.not.contain('<input'));
});

describe('when drawing a command form a dialog sends', () => {
    const markup = draw({ command: 'ApproveOrder', sentByTheDialog: true } as never);

    it('should draw the dialog\'s Cancel', () => markup.should.contain('>Cancel</button>'));
    it('should draw the dialog\'s Submit', () => markup.should.contain('>Submit</button>'));
    it('should not draw a button named after the command', () => markup.should.not.contain('>Approve order</button>'));
});

describe('when drawing a command form with a layout', () => {
    const markup = draw({ command: 'ApproveOrder', layout: { columns: [{ index: 1, width: { unit: 'fraction', value: 1 } }, { index: 2, width: { unit: 'fraction', value: 1 } }], placements: [{ field: 'orderId', row: 1, column: 1, columnSpan: 2 }] } } as never);

    it('should lay the fields out in the form\'s columns', () => markup.should.contain('grid-template-columns:minmax(0, 1fr) minmax(0, 1fr)'));
    it('should place a field where the layout says', () => markup.should.contain('grid-column:1 / span 2'));
});
