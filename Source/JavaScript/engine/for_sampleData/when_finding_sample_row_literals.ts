// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { findDescriptorSampleRowLiterals, findSampleRowLiterals, findTemplateSampleRowLiterals } from '../index';

describe('when finding sample row literals in values', () => {
    it('should find an array of multi-key objects', () => findSampleRowLiterals([{ id: 1, name: 'A' }]).should.deep.equal(['(root)']));
    it('should report the path of a nested row literal', () => findSampleRowLiterals({ table: { rows: [{ id: 1, name: 'A' }] } }).should.deep.equal(['table.rows']));
    it('should find a row literal inside an array item', () => findSampleRowLiterals({ groups: [{ title: 't', items: [{ id: 1, name: 'A' }] }] }).should.deep.equal(['groups', 'groups[0].items']));
    it('should ignore arrays of scalars', () => findSampleRowLiterals({ columns: ['a', 'b'] }).should.deep.equal([]));
    it('should ignore single-key objects, which are choices or tokens', () => findSampleRowLiterals({ choices: [{ value: 'a' }] }).should.deep.equal([]));
    it('should ignore plain objects', () => findSampleRowLiterals({ title: 'x', size: { width: 1, height: 2 } }).should.deep.equal([]));
    it('should ignore null and scalars', () => (findSampleRowLiterals(null).length + findSampleRowLiterals(5).length).should.equal(0));
});

describe('when finding sample row literals in component descriptors', () => {
    const descriptor = (component: string, defaultValue: unknown): ComponentDescriptor => ({
        component,
        properties: [{ path: 'rows', label: 'Rows', valueType: PropertyValueType.Json, default: defaultValue }],
    } as unknown as ComponentDescriptor);

    it('should name the component and property of each literal', () =>
        findDescriptorSampleRowLiterals([descriptor('Acme:grid', [{ a: 1, b: 2 }]), descriptor('Acme:list', ['x'])]).should.deep.equal(['Acme:grid: rows']));

    it('should append the location inside the default', () =>
        findDescriptorSampleRowLiterals([descriptor('Acme:tree', { nodes: [{ a: 1, b: 2 }] })]).should.deep.equal(['Acme:tree: rows.nodes']));
});

describe('when finding sample row literals in template content', () => {
    const content = {
        body: [{
            componentName: 'grid',
            properties: { rows: [{ a: 1, b: 2 }], columns: ['a'] },
            slots: { footer: [{ componentName: 'tree', properties: { nodes: [{ a: 1, b: 2 }] } }] },
        }],
    };

    it('should report each literal by component and property', () => findTemplateSampleRowLiterals(content).should.have.members(['grid.rows', 'tree.nodes']));
    it('should not treat the element tree itself as data', () => findTemplateSampleRowLiterals({ body: [{ componentName: 'a', properties: {} }, { componentName: 'b', properties: {} }] }).should.deep.equal([]));
    it('should accept a template without content', () => findTemplateSampleRowLiterals(undefined).should.deep.equal([]));
});
