// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { PropertyEditorKind, PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { defaultStructuredEditorStrings as strings } from '../defaultStructuredEditorStrings';
import { structuredProblem } from '../structuredProblem';
import { isStructured } from '../structuredValue';
import { StructuredValueEditor } from '../StructuredValueEditor';
import { byLabel, find } from './given/expandedTree';
import { expand } from './given/expandedTree';

const field = (path: string, valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path, label: path[0].toUpperCase() + path.slice(1), group: 'Content', valueType, ...extra });

const draw = (descriptor: PropertyDescriptor, value: unknown, onChange: (value: unknown) => void = () => undefined) =>
    expand(createElement(StructuredValueEditor, { descriptor, value, idPrefix: 'p', strings, disabled: false, onChange }));

const colour = field('backgroundColor', PropertyValueType.Json, { editorKind: PropertyEditorKind.StringOrList });
const scalar = field('value', PropertyValueType.Json, { editorKind: PropertyEditorKind.Scalar });
const map = field('data', PropertyValueType.Object, { editorKind: PropertyEditorKind.StringMap });
const nodes = field('items', PropertyValueType.Collection, { item: { label: 'Node', positional: true, open: true, properties: [field('label', PropertyValueType.String)] } });

describe('when every kind of plain value is described', () => {
    it('should edit each of them without JSON text', () =>
        [colour, scalar, map, nodes].map(isStructured).should.deep.equal([true, true, true, true]));
});

describe('when a word that may also be a list is changed', () => {
    let changed: unknown = 'untouched';

    it('should offer one text box for a single word', () => find(draw(colour, '#111'), node => node.type === 'input')[0].props.value!.should.equal('#111'));
    it('should turn the word into the first entry of a list', () => {
        find(draw(colour, '#111', next => { changed = next; }), node => node.type === 'button')[0].props.onClick();
        (changed as unknown[]).should.deep.equal(['#111']);
    });
    it('should offer an entry for each of a list', () => byLabel(draw(colour, ['#111', '#222']), 'Entry 2').props.value!.should.equal('#222'));
    it('should cut a list down to its first entry', () => {
        find(draw(colour, ['#111', '#222'], next => { changed = next; }), node => node.type === 'button' && node.text.endsWith('Use one value'))[0].props.onClick();
        (changed as string).should.equal('#111');
    });
});

describe('when a scalar is changed', () => {
    let changed: unknown = 'untouched';

    it('should keep a number a number', () => {
        byLabel(draw(scalar, 3, next => { changed = next; }), 'Value').props.onChange({ target: { value: '7' } });
        (changed as number).should.equal(7);
    });
    it('should convert text to a number when the type changes', () => {
        byLabel(draw(scalar, '5', next => { changed = next; }), 'Value Type').props.onChange({ target: { value: 'number' } });
        (changed as number).should.equal(5);
    });
    it('should become a flag when asked', () => {
        byLabel(draw(scalar, 'x', next => { changed = next; }), 'Value Type').props.onChange({ target: { value: 'flag' } });
        (changed as boolean).should.equal(false);
    });
});

describe('when a record under the author\'s own names is changed', () => {
    let changed: unknown = 'untouched';

    it('should draw a row for each value', () => byLabel(draw(map, { name: 'Docs', size: 3 }), 'Value of size').props.value!.should.equal('3'));
    it('should add a value under a name that is not taken', () => {
        find(draw(map, { value1: 'a' }, next => { changed = next; }), node => node.type === 'button' && node.text === 'Add value')[0].props.onClick();
        (changed as object).should.deep.equal({ value1: 'a', value2: '' });
    });
    it('should keep a number a number', () => {
        byLabel(draw(map, { size: 3 }, next => { changed = next; }), 'Value of size').props.onChange({ target: { value: '9' } });
        (changed as object).should.deep.equal({ size: 9 });
    });
    it('should leave nothing stored once the last value is removed', () => {
        byLabel(draw(map, { size: 3 }, next => { changed = next; }), 'Remove size').props.onClick();
        (changed === undefined).should.be.true;
    });
    it('should keep a value that is a structure as it is', () => {
        let kept: unknown = 'untouched';
        const tree = draw(map, { name: 'Docs', nested: { a: 1 } }, next => { kept = next; });
        byLabel(tree, 'Value of name').props.onChange({ target: { value: 'Files' } });
        (kept as object).should.deep.equal({ name: 'Files', nested: { a: 1 } });
    });
});

describe('when the items of a positional collection are changed', () => {
    let changed: unknown = 'untouched';

    it('should add an item that carries no identifier', () => {
        find(draw(nodes, [{ label: 'A' }], next => { changed = next; }), node => node.type === 'button' && node.text === 'Add node')[0].props.onClick();
        (changed as object).should.deep.equal([{ label: 'A' }, {}]);
    });
    it('should keep an item without an identifier as it is when a field changes', () => {
        find(draw(nodes, [{ label: 'A' }], next => { changed = next; }), node => node.type === 'input')[0].props.onChange({ target: { value: 'B' } });
        (changed as object).should.deep.equal([{ label: 'B' }]);
    });
    it('should keep an item whose last field is emptied', () => {
        find(draw(nodes, [{ label: 'A' }], next => { changed = next; }), node => node.type === 'input')[0].props.onChange({ target: { value: '' } });
        (changed as object).should.deep.equal([{}]);
    });
});

describe('when a value cannot be drawn by the kind of plain value it is described as', () => {
    it('should accept a list of words for a list of words', () => (structuredProblem(field('x', PropertyValueType.Json, { editorKind: PropertyEditorKind.StringList }), ['a']) === undefined).should.be.true);
    it('should report a key map for a list of words', () => structuredProblem(field('x', PropertyValueType.Json, { editorKind: PropertyEditorKind.StringList }), { a: true })!.should.contain('not a list of words'));
    it('should report words among numbers', () => structuredProblem(field('x', PropertyValueType.Json, { editorKind: PropertyEditorKind.NumberList }), [1, 'a'])!.should.contain('not a list of numbers'));
    it('should report a structure for a scalar', () => structuredProblem(scalar, { a: 1 })!.should.contain('not a word, a number'));
    it('should find the problem inside an object and an item', () =>
        structuredProblem(field('data', PropertyValueType.Object, { properties: [field('datasets', PropertyValueType.Collection, { item: { properties: [field('data', PropertyValueType.Json, { editorKind: PropertyEditorKind.NumberList })] } })] }), { datasets: [{ data: 'x' }] })!
            .should.contain('Datasets 1 / Data'));
});

describe('when an icon of an item is kept as text', () => {
    let changed: unknown = 'untouched';
    const icon = field('icon', PropertyValueType.Icon);

    it('should show the icon it names', () => find(draw(icon, 'Cratis.Icons.Lucide#plus'), node => node.type === 'input')[0].props.value!.should.equal('Cratis.Icons.Lucide#plus'));
    it('should keep the icon it is changed to as text', () => {
        find(draw(icon, undefined, next => { changed = next; }), node => node.type === 'input')[0].props.onChange!({ target: { value: 'Cratis.Icons.Lucide#check' } });
        (changed as string).should.equal('Cratis.Icons.Lucide#check');
    });
});
