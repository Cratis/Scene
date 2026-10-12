// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateValue } from '@cratis/scene.engine';
import { BindingSourceKind, PropertyDescriptor, PropertyEditorKind, PropertyValueType } from '@cratis/scene.model';
import { primeReactDescriptors } from '../primeReactDescriptors';

const known = new Set<string>(Object.values(PropertyEditorKind));

function unshaped(properties: PropertyDescriptor[], prefix: string): string[] {
    return properties.flatMap(property => {
        const path = `${prefix}${property.path}`;
        const own = (property.valueType === PropertyValueType.Json && !known.has(property.editorKind ?? ''))
            || (property.valueType === PropertyValueType.Object && property.properties === undefined && !known.has(property.editorKind ?? ''))
            ? [path] : [];
        return [...own, ...unshaped(property.properties ?? [], `${path}.`), ...unshaped(property.item?.properties ?? [], `${path}[].`)];
    });
}

describe('when describing the controls', () => {
    const find = (component: string, path: string) =>
        primeReactDescriptors.find(descriptor => descriptor.component.endsWith(`:${component}`))!.properties.find(property => property.path === path)!;

    it('should leave no property to be edited as free-form JSON', () => {
        primeReactDescriptors.flatMap(descriptor => unshaped(descriptor.properties, `${descriptor.component}.`)).should.deep.equal([]);
    });

    it('should accept a chart as it is authored without an id on its datasets', () => {
        const data = { labels: ['A', 'B'], datasets: [{ label: 'Series', data: [1, 2], backgroundColor: ['#111', '#222'], hidden: true }] };
        (validateValue(find('chart', 'data'), data) === undefined).should.be.true;
    });

    it('should refuse chart values of the wrong type', () => {
        validateValue(find('chart', 'data'), { labels: [], datasets: 'A' })!.should.contain('datasets');
    });

    it('should keep the options of a chart that it does not describe', () => {
        (validateValue(find('chart', 'options'), { plugins: { legend: { position: 'bottom', labels: { color: 'red' } } }, animation: false }) === undefined).should.be.true;
    });

    it('should refuse a legend position that is not one of the positions', () => {
        validateValue(find('chart', 'options'), { plugins: { legend: { position: 'middle' } } })!.should.contain('position');
    });

    it('should accept nested tree nodes', () => {
        const nodes = [{ label: 'Documents', data: { name: 'Documents', size: 3 }, children: [{ label: 'Work', children: [{ label: 'Plans' }] }] }];
        (validateValue(find('treeTable', 'items'), nodes) === undefined).should.be.true;
    });

    it('should accept a tree selected by one key or by several', () => {
        [validateValue(find('treeTable', 'selection'), 'a'), validateValue(find('treeTable', 'selection'), ['a', 'b'])].should.deep.equal([undefined, undefined]);
    });

    it('should accept what a screen binds a structured value to', () => {
        (validateValue(find('treeTable', 'items'), { kind: BindingSourceKind.QueryResult, path: 'folders' }) === undefined).should.be.true;
    });

    it('should describe the columns of a tree table as fields', () => {
        (validateValue(find('treeTable', 'columns'), [{ field: 'name', header: 'Name', sortable: true }]) === undefined).should.be.true;
    });

    it('should describe the options of a multi-state checkbox as states', () => {
        validateValue(find('multiStateCheckbox', 'options'), [{ label: 'On', value: 'on', icon: 1 }])!.should.contain('icon');
    });
});
