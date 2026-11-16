// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { anEditorContext } from '../../Registry/for_PropertyEditorRegistry/given/anEditorContext';
import type { PropertyEditorProps } from '../../Registry/PropertyEditorProps';
import { BooleanEditor } from '../BooleanEditor';
import { ColorEditor } from '../ColorEditor';
import { EnumEditor } from '../EnumEditor';
import { ListEditor } from '../ListEditor';
import { NumberEditor } from '../NumberEditor';
import { SelectEditor } from '../SelectEditor';
import { TextEditor } from '../TextEditor';

const descriptor = (valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path: 'p', label: 'Prop', group: 'G', valueType, ...extra });
const draw = (editor: (props: never) => ReactNode, value: unknown, property: PropertyDescriptor, extra: Partial<PropertyEditorProps<unknown>> = {}, lookups = {}) =>
    renderToStaticMarkup(createElement(editor as unknown as (props: PropertyEditorProps<unknown>) => ReactNode, { id: 'pe', value, onChange: () => undefined, descriptor: property, context: anEditorContext(lookups), ...extra }));

describe('when drawing a text editor', () => {
    it('should draw one line by default', () => draw(TextEditor, 'hi', descriptor(PropertyValueType.String)).should.contain('<input').and.contain('value="hi"'));
    it('should draw a box when the descriptor says multiline', () => draw(TextEditor, 'hi', descriptor(PropertyValueType.String, { editorOptions: { multiline: true } })).should.contain('<textarea'));
    it('should show the placeholder', () => draw(TextEditor, undefined, descriptor(PropertyValueType.String, { editorOptions: { placeholder: 'Type here' } })).should.contain('placeholder="Type here"'));
    it('should be disabled and still show its value when read-only', () => draw(TextEditor, 'kept', descriptor(PropertyValueType.String), { disabled: true }).should.contain('disabled').and.contain('value="kept"'));
    it('should mark itself invalid when the engine found a problem', () =>
        draw(TextEditor, 'x', descriptor(PropertyValueType.String), { problem: { code: 'invalidValue', message: 'Too short' } }).should.contain('aria-invalid="true"'));
});

describe('when drawing a number editor', () => {
    const markup = draw(NumberEditor, 12, descriptor(PropertyValueType.Number, { constraints: { minimum: 1, maximum: 99, integer: true }, editorOptions: { unit: 'px', step: 5 } }));

    it('should carry the limits', () => markup.should.contain('min="1"').and.contain('max="99"'));
    it('should step by the descriptor\'s step before an integer\'s one', () => markup.should.contain('step="5"'));
    it('should show the unit after the value', () => markup.should.contain('value="12"').and.contain('>px<'));
});

describe('when drawing a switch', () => {
    it('should be on when true', () => draw(BooleanEditor, true, descriptor(PropertyValueType.Boolean)).should.contain('role="switch"').and.contain('aria-checked="true"'));
    it('should read the default when never set', () => draw(BooleanEditor, undefined, descriptor(PropertyValueType.Boolean, { default: true })).should.contain('aria-checked="true"'));
    it('should be off otherwise', () => draw(BooleanEditor, undefined, descriptor(PropertyValueType.Boolean)).should.contain('aria-checked="false"'));
});

describe('when drawing enum chips', () => {
    const choices = [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'quiet', label: 'Quiet' }];
    const markup = draw(EnumEditor, 'secondary', descriptor(PropertyValueType.Enum, { choices }));

    it('should draw a chip for each choice', () => markup.should.contain('Primary').and.contain('Secondary').and.contain('Quiet'));
    it('should mark the chosen one', () => markup.should.match(/aria-checked="true"[^>]*>Secondary|studio-editor-chip--chosen"[^>]*>Secondary/));
    it('should mark only one', () => (markup.match(/aria-checked="true"/g) ?? []).length.should.equal(1));
    it('should keep a stored value that is no choice, readable', () => draw(EnumEditor, 'weird', descriptor(PropertyValueType.Enum, { choices })).should.contain('weird'));
    it('should disable every chip when read-only', () => (draw(EnumEditor, 'primary', descriptor(PropertyValueType.Enum, { choices }), { disabled: true }).match(/disabled/g) ?? []).length.should.equal(3));
});

describe('when drawing a dropdown for many choices', () => {
    const choices = [1, 2, 3, 4, 5, 6].map(value => ({ value, label: `Choice ${value}` }));

    it('should show the chosen label when closed', () => draw(SelectEditor, 3, descriptor(PropertyValueType.Enum, { choices })).should.contain('Choice 3'));
    it('should show the placeholder when nothing is chosen', () => draw(SelectEditor, undefined, descriptor(PropertyValueType.Enum, { choices })).should.contain('Choose…'));
});

describe('when drawing a colour editor', () => {
    const tokens = [{ name: 'primary', label: 'Primary', value: '#2563eb' }, { name: 'danger', label: 'Danger', value: '#dc2626' }];

    it('should offer the theme\'s tokens first', () => draw(ColorEditor, 'danger', descriptor(PropertyValueType.String), {}, { colorTokens: tokens }).should.contain('aria-label="Primary"').and.contain('aria-label="Danger"'));
    it('should mark the chosen token', () => draw(ColorEditor, 'danger', descriptor(PropertyValueType.String), {}, { colorTokens: tokens }).should.match(/aria-label="Danger"[^>]*|aria-checked="true"[^>]*aria-label="Danger"/));
    it('should offer a custom colour second', () => draw(ColorEditor, '#112233', descriptor(PropertyValueType.String), {}, { colorTokens: tokens }).should.contain('type="color"').and.contain('value="#112233"'));
    it('should offer no custom colour when only tokens are allowed', () => draw(ColorEditor, undefined, descriptor(PropertyValueType.String, { editorOptions: { tokensOnly: true } }), {}, { colorTokens: tokens }).should.not.contain('type="color"'));
});

describe('when drawing a list editor', () => {
    it('should draw a row for each entry, with its controls', () =>
        draw(ListEditor, ['a', 'b'], descriptor(PropertyValueType.Json, { editorKind: 'stringList' })).should.contain('value="a"').and.contain('value="b"').and.contain('Add'));
    it('should draw numbers as numbers', () => draw(ListEditor, [1, 2], descriptor(PropertyValueType.Json, { editorKind: 'numberList' })).should.contain('type="number"'));
});
