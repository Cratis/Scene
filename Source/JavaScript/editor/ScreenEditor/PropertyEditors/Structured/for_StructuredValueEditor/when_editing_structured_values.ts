// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { defaultStructuredEditorStrings as strings } from '../defaultStructuredEditorStrings';
import { numberListEditorKind, stringListEditorKind } from '../structuredValue';
import { StructuredValueEditor } from '../StructuredValueEditor';
import { buttonsOf, byLabel, expand, fieldOf, find } from './given/expandedTree';

const field = (path: string, valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path, label: path[0].toUpperCase() + path.slice(1), group: 'Content', valueType, ...extra });

const chartData: PropertyDescriptor = field('data', PropertyValueType.Object, {
    properties: [
        field('labels', PropertyValueType.Json, { editorKind: stringListEditorKind }),
        field('datasets', PropertyValueType.Collection, {
            item: { label: 'Dataset', properties: [field('label', PropertyValueType.String), field('data', PropertyValueType.Json, { editorKind: numberListEditorKind }), field('fill', PropertyValueType.Boolean)] },
        }),
        field('mode', PropertyValueType.Enum, { choices: [{ value: 'line', label: 'Line' }, { value: 2, label: 'Two' }] }),
    ],
});

const seen = (value: unknown): object => value as object;

const draw = (descriptor: PropertyDescriptor, value: unknown, onChange: (value: unknown) => void = () => undefined) =>
    expand(createElement(StructuredValueEditor, { descriptor, value, idPrefix: 'chart', strings, disabled: false, onChange }));

describe('when editing an object by its described fields', () => {
    const value = { labels: ['Jan', 'Feb'], datasets: [{ id: 'a', label: 'Sales', data: [1, 2], fill: true }], mode: 'line' };
    const markup = renderToStaticMarkup(createElement(StructuredValueEditor, { descriptor: chartData, value, idPrefix: 'chart', strings, disabled: false, onChange: () => undefined }));

    it('should draw the object as a group of its own', () => markup.should.contain('<legend>Data</legend>'));
    it('should draw a control for each entry of a list of words', () => markup.should.contain('aria-label="Entry 1"').and.contain('value="Jan"').and.contain('value="Feb"'));
    it('should draw a row for each item of a collection, with its fields', () => markup.should.contain('<legend>Dataset 1</legend>').and.contain('value="Sales"'));
    it('should draw a number list of an item as numbers', () => markup.should.contain('type="number"').and.contain('value="2"'));
    it('should draw a flag as a checkbox', () => markup.should.match(/type="checkbox"[^>]*checked/));
    it('should never draw text to type JSON into', () => markup.should.not.contain('<textarea'));
});

describe('when a field of an object changes', () => {
    let changed: unknown = 'untouched';
    const tree = draw(chartData, { labels: ['Jan'], mode: 'line' }, value => { changed = value; });

    it('should report the whole object with the field changed and the others kept', () => {
        byLabel(tree, 'Entry 1').props.onChange({ target: { value: 'January' } });
        seen(changed).should.deep.equal({ labels: ['January'], mode: 'line' });
    });

    it('should leave an enum field at the choice\'s own value, not its text', () => {
        fieldOf(tree, 'Mode').props.onChange({ target: { value: '1' } });
        seen(changed).should.deep.equal({ labels: ['Jan'], mode: 2 });
    });

    it('should drop a field set to nothing, and the object when nothing is left', () => {
        fieldOf(tree, 'Mode').props.onChange({ target: { value: '' } });
        seen(changed).should.deep.equal({ labels: ['Jan'] });
        const alone = draw(field('data', PropertyValueType.Object, { properties: [field('caption', PropertyValueType.String)] }), { caption: 'x' }, value => { changed = value; });
        fieldOf(alone, 'Caption').props.onChange({ target: { value: '' } });
        (changed === undefined).should.be.true;
    });

    it('should keep the fields it does not describe', () => {
        const open = draw(chartData, { labels: ['Jan'], legend: { position: 'top' } }, value => { changed = value; });
        byLabel(open, 'Entry 1').props.onChange({ target: { value: 'Mar' } });
        seen(changed).should.deep.equal({ labels: ['Mar'], legend: { position: 'top' } });
    });
});

describe('when the items of a collection are changed', () => {
    const rows: PropertyDescriptor = field('rows', PropertyValueType.Collection, { item: { label: 'Row', properties: [field('name', PropertyValueType.String), field('size', PropertyValueType.Number)] } });
    const value = [{ id: 'one', name: 'First' }, { id: 'two', name: 'Second' }];
    let changed: unknown;
    const tree = draw(rows, value, next => { changed = next; });

    it('should add an item that has an identity of its own and no fields', () => {
        find(tree, node => node.type === 'button' && node.text === 'Add row')[0].props.onClick();
        const items = changed as { id: string }[];
        [items.length, items[2].id.length > 0, Object.keys(items[2]).length].should.deep.equal([3, true, 1]);
    });

    it('should remove an item by its position and keep the others\' identities', () => {
        byLabel(tree, 'Remove row 1').props.onClick();
        seen(changed).should.deep.equal([value[1]]);
    });

    it('should move an item', () => {
        byLabel(tree, 'Move row 2 up').props.onClick();
        seen(changed).should.deep.equal([value[1], value[0]]);
    });

    it('should not offer to move the first item up or the last down', () => {
        [byLabel(tree, 'Move row 1 up').props.disabled, byLabel(tree, 'Move row 2 down').props.disabled].should.deep.equal([true, true]);
    });

    it('should change one field of one item, keeping its identity', () => {
        find(tree, node => node.type === 'input' && node.props.value === 'Second')[0].props.onChange({ target: { value: 'Other' } });
        seen(changed).should.deep.equal([value[0], { id: 'two', name: 'Other' }]);
    });

    it('should store a number as a number', () => {
        find(tree, node => node.type === 'input' && node.props.type === 'number')[0].props.onChange({ target: { value: '12' } });
        (changed as { size: number }[])[0].size.should.equal(12);
    });

    it('should stop adding at the limit the descriptor sets', () => {
        const limited = draw({ ...rows, constraints: { maximumItems: 2 } }, value);
        find(limited, node => node.type === 'button' && node.text === 'Add row')[0].props.disabled.should.be.true;
    });
});

describe('when a list of plain values is changed', () => {
    const numbers = field('data', PropertyValueType.Json, { editorKind: numberListEditorKind });
    let changed: unknown = 'untouched';

    it('should add an entry of the list\'s own type', () => {
        find(draw(numbers, [1], next => { changed = next; }), node => node.type === 'button' && node.text === 'Add entry')[0].props.onClick();
        seen(changed).should.deep.equal([1, 0]);
    });

    it('should store a number as a number', () => {
        byLabel(draw(numbers, [1], next => { changed = next; }), 'Entry 1').props.onChange({ target: { value: '7' } });
        seen(changed).should.deep.equal([7]);
    });

    it('should leave nothing stored once the last entry is removed', () => {
        byLabel(draw(numbers, [1], next => { changed = next; }), 'Remove entry 1').props.onClick();
        (changed === undefined).should.be.true;
    });
});

describe('when a property is not described well enough to edit', () => {
    const tree = draw(field('options', PropertyValueType.Object, { editorKind: 'unknown' }), { a: 1 });

    it('should say so rather than offer text to edit', () => {
        [find(tree, node => node.type === 'textarea').length, find(tree, node => node.props.role === 'alert')[0].text].should.deep.equal([0, strings.noEditor('Options')]);
    });

    it('should offer nothing to press', () => buttonsOf(tree).should.deep.equal([]));
});
