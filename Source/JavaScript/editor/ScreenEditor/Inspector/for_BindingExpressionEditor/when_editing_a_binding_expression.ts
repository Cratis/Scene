// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describe, it } from 'vitest';
import { BindingMode, BindingSourceKind, PropertyValueType, type BindingExpression } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import type { BindingSourceInventory } from '../../Binding/bindingSources';
import { LiteralEditorKind, bindingShapedValue, defaultLiteralValue, forKind, literalKindFor, literalSignature, modesFor, normalize, sourceKindChoices } from '../bindingExpressionEdits';

const text = defaultScreenEditorStrings.properties.binding;
const emptySources = { dataContextPaths: [], queryResults: [], componentOutputs: [] } as unknown as BindingSourceInventory;
const richSources = { dataContextPaths: [], queryResults: [{ id: 'q', name: 'Q', fields: [] }], componentOutputs: [{ componentId: 'c' }], commandResponse: { paths: [] } } as unknown as BindingSourceInventory;
const binding = (fields: Partial<BindingExpression> = {}): BindingExpression => ({ kind: BindingSourceKind.DataContext, path: 'a', ...fields }) as BindingExpression;
const allKinds = [BindingSourceKind.DataContext, BindingSourceKind.QueryResult, BindingSourceKind.ComponentProperty, BindingSourceKind.Literal];

describe('when finding the kind of literal editor', () => {
    it('should edit null as null', () => literalKindFor(null, PropertyValueType.String).should.equal(LiteralEditorKind.Null));
    it('should edit a number as a number', () => literalKindFor(1, PropertyValueType.String).should.equal(LiteralEditorKind.Number));
    it('should edit a boolean as a boolean', () => literalKindFor(false, PropertyValueType.String).should.equal(LiteralEditorKind.Boolean));
    it('should edit an object as json', () => literalKindFor({}, PropertyValueType.String).should.equal(LiteralEditorKind.Json));
    it('should edit an array as json', () => literalKindFor([], PropertyValueType.Number).should.equal(LiteralEditorKind.Json));
    it('should let the target decide for a string', () => literalKindFor('x', PropertyValueType.Number).should.equal(LiteralEditorKind.Number));
    it('should edit a string as a string for a string target', () => literalKindFor('x', PropertyValueType.String).should.equal(LiteralEditorKind.String));
    it('should follow a number target without a value', () => literalKindFor(undefined, PropertyValueType.Number).should.equal(LiteralEditorKind.Number));
    it('should follow a boolean target without a value', () => literalKindFor(undefined, PropertyValueType.Boolean).should.equal(LiteralEditorKind.Boolean));
    it('should follow an object target without a value', () => literalKindFor(undefined, PropertyValueType.Object).should.equal(LiteralEditorKind.Json));
    it('should follow a collection target without a value', () => literalKindFor(undefined, PropertyValueType.Collection).should.equal(LiteralEditorKind.Json));
    it('should follow a json target without a value', () => literalKindFor(undefined, PropertyValueType.Json).should.equal(LiteralEditorKind.Json));
    it('should default to a string', () => literalKindFor(undefined, PropertyValueType.String).should.equal(LiteralEditorKind.String));
    it('should sign the kind with the value', () => literalSignature(1, PropertyValueType.String).should.equal('{"kind":"number","value":1}'));
    it('should sign an absent value', () => literalSignature(undefined, PropertyValueType.String).should.equal('{"kind":"string"}'));
    it('should start each kind from its empty value', () => [LiteralEditorKind.String, LiteralEditorKind.Number, LiteralEditorKind.Boolean, LiteralEditorKind.Null, LiteralEditorKind.Json]
        .map(defaultLiteralValue).should.deep.equal(['', 0, false, null, {}]));
});

describe('when recognising a value shaped like a binding', () => {
    it('should recognise an object with a binding key', () => (bindingShapedValue({ path: 'x' }) as object).should.deep.equal({ path: 'x' }));
    it('should not recognise an unrelated object', () => (bindingShapedValue({ other: 1 }) === undefined).should.be.true);
    it('should not recognise an array', () => (bindingShapedValue(['path']) === undefined).should.be.true);
    it('should not recognise a primitive', () => (bindingShapedValue('path') === undefined).should.be.true);
    it('should not recognise nothing', () => (bindingShapedValue(null) === undefined).should.be.true);
});

describe('when editing a binding of each kind', () => {
    it('should clear the other sources of a literal', () => normalize(binding({ kind: BindingSourceKind.Literal, query: 'q', componentId: 'c' })).should.include({ path: '' }).and.have.property('query', undefined));
    it('should clear the value of a query result', () => (normalize(binding({ kind: BindingSourceKind.QueryResult, value: 1 })).value === undefined).should.be.true);
    it('should take the component property as the path', () => normalize(binding({ kind: BindingSourceKind.ComponentProperty, componentPropertyPath: 'p' })).path.should.equal('p'));
    it('should clear the other sources of a data context', () => (normalize(binding({ query: 'q', componentId: 'c', value: 1 })).query === undefined).should.be.true);
    it('should start a literal empty', () => forKind(BindingSourceKind.Literal, binding()).should.deep.equal({ kind: BindingSourceKind.Literal, path: '', value: '' }));
    it('should keep the literal value held', () => forKind(BindingSourceKind.Literal, binding({ value: 5 })).value!.should.equal(5));
    it('should keep the query when switching to a query result', () => forKind(BindingSourceKind.QueryResult, binding({ query: 'q' })).query!.should.equal('q'));
    it('should carry the component property path', () => forKind(BindingSourceKind.ComponentProperty, binding({ componentPropertyPath: 'p' })).path!.should.equal('p'));
    it('should fall back to the path for the component property', () => forKind(BindingSourceKind.ComponentProperty, binding()).componentPropertyPath!.should.equal('a'));
    it('should drop two way when switching to a command response', () => (forKind(BindingSourceKind.CommandResponse, binding({ mode: BindingMode.TwoWay })).mode === undefined).should.be.true);
    it('should keep one way when switching to a command response', () => forKind(BindingSourceKind.CommandResponse, binding({ mode: BindingMode.OneWay })).mode!.should.equal(BindingMode.OneWay));
    it('should keep only the path when switching to a data context', () => forKind(BindingSourceKind.DataContext, binding()).should.deep.equal({ kind: BindingSourceKind.DataContext, path: 'a' }));
});

describe('when offering modes', () => {
    it('should offer both modes for a data context', () => modesFor(binding()).should.deep.equal([BindingMode.OneWay, BindingMode.TwoWay]));
    it('should offer only one way for a command response', () => modesFor(binding({ kind: BindingSourceKind.CommandResponse })).should.deep.equal([BindingMode.OneWay]));
    it('should keep two way when a command response already holds it', () => modesFor(binding({ kind: BindingSourceKind.CommandResponse, mode: BindingMode.TwoWay })).should.have.length(2));
});

describe('when offering source kinds', () => {
    const choices = (b: BindingExpression, accepted: readonly BindingSourceKind[], sources: BindingSourceInventory) => sourceKindChoices(b, accepted, sources, text);
    const byKind = (list: ReturnType<typeof choices>, kind: BindingSourceKind) => list.find(choice => choice.kind === kind)!;

    it('should leave out the command response unless accepted or held', () => (choices(binding(), allKinds, richSources).some(choice => choice.kind === BindingSourceKind.CommandResponse)).should.be.false);
    it('should offer the command response when accepted', () => (byKind(choices(binding(), [...allKinds, BindingSourceKind.CommandResponse], richSources), BindingSourceKind.CommandResponse).disabled === false).should.be.true);
    it('should offer the command response when held', () => (choices(binding({ kind: BindingSourceKind.CommandResponse }), allKinds, richSources).some(choice => choice.kind === BindingSourceKind.CommandResponse)).should.be.true);
    it('should disable a query result without queries', () => byKind(choices(binding(), allKinds, emptySources), BindingSourceKind.QueryResult).disabled!.should.be.true);
    it('should say why a query result is unavailable', () => byKind(choices(binding(), allKinds, emptySources), BindingSourceKind.QueryResult).reason!.should.equal(text.unavailableSource));
    it('should disable a component property without outputs', () => byKind(choices(binding(), allKinds, emptySources), BindingSourceKind.ComponentProperty).disabled!.should.be.true);
    it('should disable a source the property does not accept', () => byKind(choices(binding(), [BindingSourceKind.DataContext], richSources), BindingSourceKind.Literal).disabled!.should.be.true);
    it('should say a source is incompatible', () => byKind(choices(binding(), [BindingSourceKind.DataContext], richSources), BindingSourceKind.Literal).reason!.should.equal(text.incompatibleSource));
    it('should keep the held source selectable though unavailable', () => byKind(choices(binding({ kind: BindingSourceKind.QueryResult }), allKinds, emptySources), BindingSourceKind.QueryResult).disabled!.should.be.false);
    it('should say the command response is out of scope', () => byKind(choices(binding({ kind: BindingSourceKind.CommandResponse }), [...allKinds, BindingSourceKind.CommandResponse], emptySources), BindingSourceKind.CommandResponse).reason!.should.equal(text.commandResponseOutOfScope));
    it('should label each source', () => byKind(choices(binding(), allKinds, richSources), BindingSourceKind.Literal).label.should.equal(text.sources.literal));
    it('should give no reason for an available source', () => (byKind(choices(binding(), allKinds, richSources), BindingSourceKind.DataContext).reason === undefined).should.be.true);
});
