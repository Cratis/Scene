// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type ComponentDescriptor } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { designTimeSamples } from '../../Surface/DesignTime/designTimeSamples';
import { createScreenEditorRuntime } from '../screenEditorRuntime';
import { contentGroup, withSampleContentProperties } from '../withSampleContentProperties';
import { numberListEditorKind, stringListEditorKind } from '../../PropertyEditors/Structured/structuredValue';
import { singularOf } from '../describeSampleValue';

const bare = (component: string, ...paths: string[]): ComponentDescriptor => ({ component, properties: paths.map(path => ({ path, label: path, group: 'General', valueType: PropertyValueType.String })) });
const byPath = (descriptor: ComponentDescriptor, path: string) => descriptor.properties.find(property => property.path === path);

describe('when a component shows sample content its descriptor leaves out', () => {
    const described = withSampleContentProperties(bare('PrimeReact:tag'));

    it('should describe the value, so it can be set', () => byPath(described, 'value')!.valueType.should.equal(PropertyValueType.String));
    it('should group it under Content', () => byPath(described, 'value')!.group!.should.equal(contentGroup));
    it('should say it is shown as a sample', () => byPath(described, 'value')!.description!.should.contain('sample'));
    it('should not give it a default, so nothing is saved that was not set', () => (byPath(described, 'value')!.default === undefined).should.be.true);
});

describe('when a sample holds numbers, lists and flags', () => {
    it('should edit a number as a number', () => byPath(withSampleContentProperties(bare('PrimeReact:progressBar')), 'value')!.valueType.should.equal(PropertyValueType.Number));
    it('should edit a list of records as a collection', () => byPath(withSampleContentProperties(bare('PrimeReact:carousel')), 'items')!.valueType.should.equal(PropertyValueType.Collection));
    it('should describe the fields of those records', () => byPath(withSampleContentProperties(bare('PrimeReact:carousel')), 'items')!.item!.properties.map(field => field.path).should.deep.equal(['title', 'description']));
    it('should edit a list of words as a list of strings', () => byPath(withSampleContentProperties(bare('PrimeReact:dropdown')), 'options')!.editorKind!.should.equal(stringListEditorKind));
    it('should edit a record as an object with its fields', () => byPath(withSampleContentProperties(bare('PrimeReact:objectContentEditor')), 'object')!.properties!.map(field => `${field.path}:${field.valueType}`).should.deep.equal(['name:string', 'amount:number']));
});

describe('when a sample holds nested lists and records', () => {
    const chart = byPath(withSampleContentProperties(bare('PrimeReact:chart')), 'data')!;

    it('should describe the chart data as an object', () => chart.valueType.should.equal(PropertyValueType.Object));
    it('should describe its labels as a list of words', () => chart.properties!.find(field => field.path === 'labels')!.editorKind!.should.equal(stringListEditorKind));
    it('should describe its datasets as a collection', () => chart.properties!.find(field => field.path === 'datasets')!.valueType.should.equal(PropertyValueType.Collection));
    it('should describe the numbers of a dataset as a list of numbers', () => chart.properties!.find(field => field.path === 'datasets')!.item!.properties.find(field => field.path === 'data')!.editorKind!.should.equal(numberListEditorKind));
    it('should keep a menu\'s separators out of its item fields as an item of their own', () => byPath(withSampleContentProperties(bare('PrimeReact:menu')), 'items')!.item!.properties.map(field => field.path).should.deep.equal(['separator']));
});

describe('when no property of a sampled component is left as raw JSON', () => {
    const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'x', packages: [] } as never);
    const raw = runtime.descriptors.flatMap(descriptor => {
        const sample = designTimeSamples[descriptor.component] ?? designTimeSamples[descriptor.component.slice(descriptor.component.lastIndexOf(':') + 1)];
        return descriptor.properties
            .filter(property => property.valueType === PropertyValueType.Json && property.editorKind === undefined && sample !== undefined && typeof sample[property.path] === 'object')
            .map(property => `${descriptor.component}.${property.path}`);
    });

    it('should describe every sampled structure by its shape', () => raw.should.deep.equal([]));
});

describe('when a descriptor calls a property any JSON and a sample shows its shape', () => {
    const own: ComponentDescriptor = { component: 'PrimeReact:carousel', properties: [{ path: 'items', label: 'Slides', group: 'Data', valueType: PropertyValueType.Json, description: 'The slides.', constraints: { required: true } }] };
    const shaped = byPath(withSampleContentProperties(own), 'items')!;

    it('should take the shape of the sample', () => shaped.valueType.should.equal(PropertyValueType.Collection));
    it('should keep the label, group and description the descriptor gave', () => [shaped.label, shaped.group, shaped.description].should.deep.equal(['Slides', 'Data', 'The slides.']));
    it('should keep its constraints', () => shaped.constraints!.should.deep.equal({ required: true }));
    it('should not add the property a second time', () => withSampleContentProperties(own).properties.filter(property => property.path === 'items').length.should.equal(1));
});

describe('when the descriptor already has a property', () => {
    const own = bare('PrimeReact:tag', 'value');

    it('should leave it alone', () => withSampleContentProperties(own).properties.filter(property => property.path === 'value').length.should.equal(1));
});

describe('when a component has no sample', () => {
    const descriptor = bare('Acme:widget');

    it('should return the descriptor as it is', () => (withSampleContentProperties(descriptor) === descriptor).should.be.true);
});

describe('when the runtime describes every component that shows a sample', () => {
    const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'x', packages: [] } as never);
    const missing = runtime.descriptors
        .filter(descriptor => descriptor.component.includes(':'))
        .flatMap(descriptor => {
            const sample = designTimeSamples[descriptor.component] ?? designTimeSamples[descriptor.component.slice(descriptor.component.lastIndexOf(':') + 1)];
            return sample ? Object.keys(sample).filter(key => !descriptor.properties.some(property => property.path === key)).map(key => `${descriptor.component}.${key}`) : [];
        });

    it('should leave no sample content the inspector cannot set', () => missing.should.deep.equal([]));
});

describe('when naming what one entry of a list is', () => {
    it('should drop the plural', () => ['Datasets', 'Items', 'Rows', 'Nodes'].map(singularOf).should.deep.equal(['Dataset', 'Item', 'Row', 'Node']));
    it('should turn "ies" into "y"', () => singularOf('Categories').should.equal('Category'));
    it('should leave a word that is not a plural', () => ['Status', 'Address', 'Children'].map(singularOf).should.deep.equal(['Status', 'Address', 'Children']));
    it('should name the items of a described collection', () => byPath(withSampleContentProperties(bare('PrimeReact:chart')), 'data')!.properties!.find(field => field.path === 'datasets')!.item!.label!.should.equal('Dataset'));
});
