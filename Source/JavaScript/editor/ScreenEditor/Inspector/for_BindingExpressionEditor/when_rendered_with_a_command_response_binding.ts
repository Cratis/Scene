// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BindingMode, BindingSourceKind, PropertyValueType, ValueSource, type BindingExpression, type InspectedProperty } from '@cratis/scene.model';
import type { BindingSourceInventory } from '../../Binding/bindingSources';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { BindingExpressionEditor } from '../BindingExpressionEditor';

const ordinaryKinds = [BindingSourceKind.DataContext, BindingSourceKind.QueryResult, BindingSourceKind.ComponentProperty, BindingSourceKind.Literal];
const inScope: BindingSourceInventory = { dataContextPaths: [], queryResults: [], componentOutputs: [], commandResponse: { command: 'CreateProject', paths: ['projectId', 'name'] } };
const outOfScope: BindingSourceInventory = { dataContextPaths: [], queryResults: [], componentOutputs: [] };
const outOfScopeText = defaultScreenEditorStrings.properties.binding.commandResponseOutOfScope;

const propertyOf = (value: BindingExpression, accepted: BindingSourceKind[]): InspectedProperty => ({
    descriptor: { path: 'title', label: 'Title', group: 'General', valueType: PropertyValueType.String, acceptedBindingKinds: accepted },
    currentValue: value,
    effectiveValue: value,
    source: ValueSource.Local,
    editable: true,
});

const render = (property: InspectedProperty, sources: BindingSourceInventory): string => renderToStaticMarkup(React.createElement(BindingExpressionEditor, {
    property,
    sources,
    strings: defaultScreenEditorStrings,
    disabled: false,
    onChange: () => undefined,
}));

const commandResponse: BindingExpression = { kind: BindingSourceKind.CommandResponse, path: 'projectId' };
const dataContext: BindingExpression = { kind: BindingSourceKind.DataContext, path: 'row.id' };

describe('when rendered with a command response binding where a command response is in scope', () => {
    const html = render(propertyOf(commandResponse, [...ordinaryKinds, BindingSourceKind.CommandResponse]), inScope);

    it('should show it as a command response', () => html.should.contain('Command response'));
    it('should keep the authored path editable', () => html.should.contain('value="projectId"'));
    it('should offer the response fields as paths', () => {
        html.should.contain('<option value="projectId">');
        html.should.contain('<option value="name">');
    });
    it('should not say it is not understood', () => html.should.not.contain('not understood by this editor'));
    it('should not alert that nothing is in scope', () => html.should.not.contain(outOfScopeText));
    it('should offer only the one-way mode', () => html.should.not.contain('<option value="twoWay">'));
});

describe('when rendered with a command response binding where no command response is in scope', () => {
    const html = render(propertyOf(commandResponse, ordinaryKinds), outOfScope);

    it('should show it as a command response', () => html.should.contain('Command response'));
    it('should keep the authored path', () => html.should.contain('value="projectId"'));
    it('should explain that it only has a value after a command succeeds', () => html.should.contain(outOfScopeText));
    it('should not say it is not understood', () => html.should.not.contain('not understood by this editor'));
});

describe('when rendered with a two-way command response binding', () => {
    const html = render(propertyOf({ ...commandResponse, mode: BindingMode.TwoWay }, ordinaryKinds), inScope);

    it('should still show the stored mode', () => html.should.contain('<option value="twoWay" selected="">'));
});

describe('when rendered for a property that accepts a command response with one in scope', () => {
    const html = render(propertyOf(dataContext, [...ordinaryKinds, BindingSourceKind.CommandResponse]), inScope);

    it('should list the command response as a choice', () => html.should.contain('<option value="commandResponse">Command response</option>'));
});

describe('when rendered for a property that accepts a command response with none in scope', () => {
    const html = render(propertyOf(dataContext, [...ordinaryKinds, BindingSourceKind.CommandResponse]), outOfScope);

    it('should list the command response as a disabled choice', () => html.should.contain('<option value="commandResponse" disabled="">Command response</option>'));
    it('should give the reason', () => html.should.contain(outOfScopeText));
});

describe('when rendered for an ordinary property', () => {
    const html = render(propertyOf(dataContext, ordinaryKinds), inScope);

    it('should not list the command response', () => html.should.not.contain('Command response'));
});
