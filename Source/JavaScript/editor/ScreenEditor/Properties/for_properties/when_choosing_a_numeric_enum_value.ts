// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type InspectedProperty } from '@cratis/scene.model';
import { choiceKey, choiceOptions, choiceValueOf, selectedChoiceKey } from '../choiceKeys';
import { elementNodeId, inspect } from '@cratis/scene.engine';
import { applyToSession, openSession, undo } from '../../Session/EditSession';
import { editForValue } from '../propertyEdits';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { editingScreen, inspectProperty, openChart, setThroughTheSession } from '../../PropertyEditors/Structured/for_StructuredValueEditor/given/aChartInTheSession';

const ambiguous = (): InspectedProperty => ({
    descriptor: { path: 'size', label: 'Size', group: 'Content', valueType: PropertyValueType.Enum, choices: [{ value: 1, label: 'One' }, { value: '1', label: 'One as text' }, { value: 0, label: 'Zero' }, { value: true, label: 'Yes' }] },
    currentValue: 0, effectiveValue: 0, source: 'local', editable: true,
} as unknown as InspectedProperty);

describe('when the choices hold a number and a string that read alike', () => {
    const options = ambiguous().descriptor.choices!.map(choice => choiceKey(choice.value));

    it('should give every choice its own key', () => new Set(options).size.should.equal(4));
    it('should give back the number for the number\'s key', () => (choiceValueOf(ambiguous(), choiceKey(1))!.value === 1).should.be.true);
    it('should give back the string for the string\'s key', () => (choiceValueOf(ambiguous(), choiceKey('1'))!.value === '1').should.be.true);
    it('should give back zero, not nothing', () => (choiceValueOf(ambiguous(), choiceKey(0))!.value === 0).should.be.true);
    it('should give back a boolean as a boolean', () => (choiceValueOf(ambiguous(), choiceKey(true))!.value === true).should.be.true);
    it('should name no choice for a key that is not one', () => (choiceValueOf(ambiguous(), 'number:7') === undefined).should.be.true);
    it('should select the choice that is stored, by the same key', () => (selectedChoiceKey(ambiguous().effectiveValue) === choiceKey(0)).should.be.true);
});

describe('when the real chart offers its type as names, ordinals and legacy names', () => {
    const type = inspectProperty(openChart(), 'type');
    const keys = type.descriptor.choices!.map(choice => choiceKey(choice.value));

    it('should offer every choice under a distinct key', () => new Set(keys).size.should.equal(type.descriptor.choices!.length));
    it('should offer the ordinals as numbers', () => type.descriptor.choices!.filter(choice => typeof choice.value === 'number').length.should.be.greaterThan(0));

    describe('and the author picks the legacy ordinal 0', () => {
        const picked = choiceValueOf(type, choiceKey(0))!.value;
        const session = setThroughTheSession(openChart(), 'type', picked);

        it('should be applied as the number zero', () => (picked === 0).should.be.true);
        it('should be accepted by the engine', () => session.diagnostics.length.should.equal(0));
        it('should store the number, not the text', () => (inspectProperty(session, 'type').currentValue === 0).should.be.true);
        it('should select that choice again when the property is drawn', () => (selectedChoiceKey(inspectProperty(session, 'type').effectiveValue) === choiceKey(0)).should.be.true);
        it('should be a single undo step', () => session.undoable.length.should.equal(1));
        it('should undo back to the default', () => (inspectProperty(undo(session), 'type').currentValue === undefined).should.be.true);
        it('should keep the number through the document a save would write', () => JSON.stringify(session.document).should.contain('"type":0'));
    });

    describe('and the author picks a name', () => {
        const session = setThroughTheSession(openChart(), 'type', choiceValueOf(type, choiceKey('line'))!.value);

        it('should store the name', () => inspectProperty(session, 'type').currentValue!.should.equal('line'));
    });
});

describe('when the author picks the unset option of a choice', () => {
    const type = inspectProperty(openChart(), 'type');

    it('should be reported by the control as nothing and mean a reset, not be dropped', () => (choiceValueOf(type, undefined) !== undefined && choiceValueOf(type, undefined)!.value === undefined).should.be.true);
    it('should mean a reset for the control\'s empty key too', () => (choiceValueOf(type, '')!.value === undefined).should.be.true);
    it('should mean a reset for null', () => (choiceValueOf(type, null)!.value === undefined).should.be.true);

    describe('on a chart holding the legacy ordinal 0', () => {
        const held = setThroughTheSession(openChart(), 'type', 0);
        const reset = setThroughTheSession(held, 'type', choiceValueOf(inspectProperty(held, 'type'), undefined)!.value);

        it('should hold the number zero before', () => (inspectProperty(held, 'type').currentValue === 0).should.be.true);
        it('should leave the property holding nothing, so the default applies', () => (inspectProperty(reset, 'type').currentValue === undefined).should.be.true);
        it('should draw the default again', () => (inspectProperty(reset, 'type').effectiveValue === 'bar').should.be.true);
        it('should take the value out of the document a save would write', () => JSON.stringify(reset.document).should.not.contain('"type"'));
        it('should be a step of its own', () => reset.undoable.length.should.equal(2));
        it('should bring the ordinal back on undo', () => (inspectProperty(undo(reset), 'type').currentValue === 0).should.be.true);
    });

    describe('on a component whose enum holds a name', () => {
        const held = setThroughTheSession(openChart(), 'type', 'line');
        const reset = setThroughTheSession(held, 'type', choiceValueOf(inspectProperty(held, 'type'), '')!.value);

        it('should reset to nothing', () => (inspectProperty(reset, 'type').currentValue === undefined).should.be.true);
        it('should bring the name back on undo', () => (inspectProperty(undo(reset), 'type').currentValue === 'line').should.be.true);
    });
});

describe('when the real action offers where it opens as a choice', () => {
    const open = () => openSession(createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('go', 'Go', 'core:action', {})])));
    const presentation = (session: ReturnType<typeof open>) => inspect(session.document, elementNodeId('go'), editingScreen)!.properties.find(property => property.descriptor.path === 'opens')!;
    const choices = presentation(open()).descriptor.choices!;
    const pick = choices[choices.length - 1].value;
    const set = (session: ReturnType<typeof open>, value: unknown) => applyToSession(session, editForValue('go', presentation(session), value), editingScreen, 'Edit');
    const held = set(open(), pick);
    const reset = set(held, choiceValueOf(presentation(held), undefined)!.value);

    it('should hold the picked choice', () => (presentation(held).currentValue === pick).should.be.true);
    it('should hold nothing after the unset option', () => (presentation(reset).currentValue === undefined).should.be.true);
    it('should return the choice on undo', () => (presentation(undo(reset)).currentValue === pick).should.be.true);
});

describe('when a choice property holds nothing or something that is no choice', () => {
    const drawn = (effectiveValue: unknown) => ({
        options: choiceOptions(ambiguous().descriptor.choices!, effectiveValue).map(option => ({ value: option.key, label: option.label })),
        value: selectedChoiceKey(effectiveValue),
    });

    it('should select the unset option when the property was never set', () => drawn(undefined).value.should.equal(''));
    it('should select the unset option when Scene reports null', () => drawn(null).value.should.equal(''));
    it('should offer no extra option for an unset property', () => drawn(undefined).options.length.should.equal(4));
    it('should show a stored number that is no choice as that number, not as an internal key', () => drawn(7).options.find(option => option.value === choiceKey(7))!.label.should.equal('7'));
    it('should show a stored text that is no choice as that text', () => drawn('weird').options.find(option => option.value === choiceKey('weird'))!.label.should.equal('weird'));
    it('should select that stored value by its key', () => drawn(7).value.should.equal(choiceKey(7)));
    it('should not offer the stored choice twice', () => drawn(1).options.length.should.equal(4));
    it('should keep the number 1 and the text 1 apart', () => (drawn('1').value === choiceKey('1') && drawn(1).value === choiceKey(1) && choiceKey('1') !== choiceKey(1)).should.be.true);
});
