// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticSeverity, PropertyValueType, type PropertyDescriptor, type SceneDiagnostic } from '@cratis/scene.model';
import { problemOf } from '../PropertyEditorHost';
import { inspected, renderedHost } from './given/renderedHost';

const descriptor = (valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path: 'title', label: 'Title', group: 'Content', valueType, ...extra });

describe('when drawing a text property that may be edited', () => {
    let markup = '';
    beforeAll(async () => { markup = await renderedHost(inspected(descriptor(PropertyValueType.String, { description: 'Shown in the header.' }), 'Orders')); });

    it('should label the editor', () => markup.should.contain('>Title</label>'));
    it('should draw the text editor the registry resolved', () => markup.should.contain('data-editor="text"').and.contain('value="Orders"'));
    it('should show the descriptor\'s description', () => markup.should.contain('Shown in the header.'));
    it('should not say anything is wrong', () => markup.should.not.contain('role="alert"'));
});

describe('when drawing a property the template does not expose', () => {
    let markup = '';
    beforeAll(async () => { markup = await renderedHost(inspected(descriptor(PropertyValueType.String), 'Kept', { editable: false, reason: 'Inherited from the Shell template.' })); });

    it('should show it disabled, still holding its value', () => markup.should.contain('disabled').and.contain('value="Kept"'));
    it('should say why', () => markup.should.contain('Inherited from the Shell template.'));
});

describe('when drawing a read-only property', () => {
    it('should say it cannot be changed here', async () => (await renderedHost(inspected(descriptor(PropertyValueType.String, { readOnly: true }), 'x'))).should.contain('This property cannot be changed here.'));
});

describe('when the engine reports a problem with the value', () => {
    const diagnostics: SceneDiagnostic[] = [{ code: 'invalidValue', severity: DiagnosticSeverity.Error, path: 'title', message: 'Title is too long.' }];
    let markup = '';
    beforeAll(async () => { markup = await renderedHost(inspected(descriptor(PropertyValueType.String), 'x'), diagnostics); });

    it('should show the engine\'s message inline', () => markup.should.contain('Title is too long.'));
    it('should carry the engine\'s code, for a host to switch on', () => markup.should.contain('data-code="invalidValue"'));
    it('should mark the editor invalid', () => markup.should.contain('aria-invalid="true"'));
    it('should attribute a problem to its property only', () => (problemOf(inspected(descriptor(PropertyValueType.String, { path: 'other' }), 'x'), diagnostics) === undefined).should.be.true);
    it('should ignore a warning', () => (problemOf(inspected(descriptor(PropertyValueType.String), 'x'), [{ ...diagnostics[0], severity: DiagnosticSeverity.Warning }]) === undefined).should.be.true);
});

describe('when drawing an object nothing describes', () => {
    it('should report it instead of offering a box of JSON', async () => {
        const markup = await renderedHost(inspected(descriptor(PropertyValueType.Json), { a: 1 }));
        markup.should.contain('role="alert"').and.contain('data-editor="undescribed"');
        markup.should.not.contain('<textarea');
    });
});

describe('when drawing a switch property', () => {
    it('should put its label inline beside the switch', async () => (await renderedHost(inspected(descriptor(PropertyValueType.Boolean), true))).should.contain('studio-editor-field--inline').and.contain('role="switch"'));
});

describe('when drawing a property saved before its descriptor described it', () => {
    const collection = descriptor(PropertyValueType.Collection, { item: { properties: [{ path: 'label', label: 'Label', group: 'G', valueType: PropertyValueType.String }] } });
    let markup = '';
    beforeAll(async () => { markup = await renderedHost(inspected(collection, [{ label: 'No identifier' }])); });

    it('should report the mismatch rather than editing it blind', () => markup.should.contain('studio-editor-structured__mismatch'));
    it('should offer to convert it and to clear it', () => markup.should.contain('Give its items identifiers').and.contain('Clear the value'));
});
