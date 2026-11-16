// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { BindingSourceKind, PropertyValueType, ValueSource, type InspectedProperty } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { BindingExpressionEditor } from '../BindingExpressionEditor';

const property: InspectedProperty = {
    descriptor: {
        path: 'title',
        label: 'Title',
        group: 'General',
        valueType: PropertyValueType.String,
        acceptedBindingKinds: [BindingSourceKind.DataContext, BindingSourceKind.QueryResult, BindingSourceKind.ComponentProperty, BindingSourceKind.Literal],
    },
    currentValue: { kind: BindingSourceKind.ComponentProperty, componentId: 'missing-component', componentPropertyPath: 'selectedItem', path: 'selectedItem' },
    effectiveValue: { kind: BindingSourceKind.ComponentProperty, componentId: 'missing-component', componentPropertyPath: 'selectedItem', path: 'selectedItem' },
    source: ValueSource.Local,
    editable: true,
};

describe('when rendered with an unavailable component source', () => {
    const html = renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
        property,
        sources: { dataContextPaths: ['row.id'], queryResults: [{ id: 'all-orders', name: 'AllOrders', fields: ['orderId'] }], componentOutputs: [] },
        strings: defaultScreenEditorStrings,
        disabled: false,
        onChange: () => undefined,
    }));

    it('should keep the missing component visible', () => html.should.contain('Missing component: missing-component'));
    it('should offer typed source choices', () => {
        html.should.contain('Data context');
        html.should.contain('Query result');
        html.should.contain('Component property');
        html.should.contain('Literal value');
    });
    it('should keep the authored component property path', () => html.should.contain('selectedItem'));
});

describe('when rendered with an unsupported binding-shaped value', () => {
    const html = renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
        property: {
            ...property,
            currentValue: { kind: 'PackageSpecific', path: 'legacy.value' },
            effectiveValue: { kind: 'PackageSpecific', path: 'legacy.value' },
        } as InspectedProperty,
        sources: { dataContextPaths: [], queryResults: [], componentOutputs: [] },
        strings: defaultScreenEditorStrings,
        disabled: false,
        onChange: () => undefined,
    }));

    it('should show that the authored value is preserved', () => html.should.contain('not understood by this editor'));
    it('should show the unknown binding payload', () => html.should.contain('PackageSpecific'));
    it('should offer an explicit replacement action', () => html.should.contain('Replace with a supported binding'));
    it('should not render routine binding controls that would overwrite the unknown payload', () => {
        html.should.not.contain('No source of this kind is available');
        html.should.not.contain('Mode');
        html.should.not.contain('Expected type');
    });
});

describe('when rendered with a typed literal value', () => {
    const html = renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
        property: {
            ...property,
            descriptor: { ...property.descriptor, valueType: PropertyValueType.Number, acceptedBindingKinds: [BindingSourceKind.Literal] },
            currentValue: { kind: BindingSourceKind.Literal, path: '', value: 42, expectedValueType: PropertyValueType.Number },
            effectiveValue: { kind: BindingSourceKind.Literal, path: '', value: 42, expectedValueType: PropertyValueType.Number },
        },
        sources: { dataContextPaths: [], queryResults: [], componentOutputs: [] },
        strings: defaultScreenEditorStrings,
        disabled: false,
        onChange: () => undefined,
    }));

    it('should render the literal as a number editor', () => html.should.contain('type="number"'));
    it('should keep the numeric value visible', () => html.should.contain('value="42"'));
});

describe('when rendered after the same literal property is restored to a boolean value', () => {
    const html = renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
        property: {
            ...property,
            descriptor: { ...property.descriptor, valueType: PropertyValueType.Boolean, acceptedBindingKinds: [BindingSourceKind.Literal] },
            currentValue: { kind: BindingSourceKind.Literal, path: '', value: true, expectedValueType: PropertyValueType.Boolean },
            effectiveValue: { kind: BindingSourceKind.Literal, path: '', value: true, expectedValueType: PropertyValueType.Boolean },
        },
        sources: { dataContextPaths: [], queryResults: [], componentOutputs: [] },
        strings: defaultScreenEditorStrings,
        disabled: false,
        onChange: () => undefined,
    }));

    it('should render the boolean editor rather than stale numeric controls', () => {
        html.should.contain('<option value="true" selected="">true</option>');
        html.should.not.contain('type="number"');
    });
});

describe('when a literal binding holds a structure its descriptor describes', () => {
    const described = {
        ...property.descriptor, valueType: PropertyValueType.Object, acceptedBindingKinds: [BindingSourceKind.Literal],
        properties: [{ path: 'saved', label: 'Saved', group: 'Content', valueType: PropertyValueType.String }],
    };
    const html = renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
        property: {
            ...property,
            descriptor: described,
            currentValue: { kind: BindingSourceKind.Literal, path: '', value: { saved: 'older' }, expectedValueType: PropertyValueType.Object },
            effectiveValue: { kind: BindingSourceKind.Literal, path: '', value: { saved: 'older' }, expectedValueType: PropertyValueType.Object },
        },
        sources: { dataContextPaths: [], queryResults: [], componentOutputs: [] },
        strings: defaultScreenEditorStrings,
        disabled: false,
        onChange: () => undefined,
    }));

    it('should edit it field by field', () => html.should.contain('value="older"'));
    it('should not offer it as text to type JSON into', () => html.should.not.contain('<textarea'));
});

describe('when a literal binding holds a structure nothing describes', () => {
    const html = renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
        property: {
            ...property,
            descriptor: { ...property.descriptor, valueType: PropertyValueType.Json, acceptedBindingKinds: [BindingSourceKind.Literal] },
            currentValue: { kind: BindingSourceKind.Literal, path: '', value: { saved: 'older' }, expectedValueType: PropertyValueType.Json },
            effectiveValue: { kind: BindingSourceKind.Literal, path: '', value: { saved: 'older' }, expectedValueType: PropertyValueType.Json },
        },
        sources: { dataContextPaths: [], queryResults: [], componentOutputs: [] },
        strings: defaultScreenEditorStrings,
        disabled: false,
        onChange: () => undefined,
    }));

    it('should say a literal cannot be authored', () => html.should.contain(defaultScreenEditorStrings.properties.binding.literalNoEditor));
    it('should not offer a box to type JSON into', () => html.should.not.contain('<textarea'));
});
