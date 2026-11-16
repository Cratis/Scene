// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { anEditorContext } from '../../Registry/for_PropertyEditorRegistry/given/anEditorContext';
import type { EditorLookups, PropertyEditorProps } from '../../Registry/PropertyEditorProps';
import { defaultPropertyEditorStrings } from '../../Registry/PropertyEditorStrings';
import { SearchableSelect, filterOptions } from '../../Registry/SearchableSelect';
import { ColumnListEditor } from '../ColumnListEditor';
import { fieldCandidates } from '../FieldEditor';
import { fieldKindOf } from '../fieldKind';
import { InheritanceModeEditor } from '../InheritanceModeEditor';
import { NavigationTargetEditor } from '../NavigationTargetEditor';
import { RenderingSlotEditor, slotRegion } from '../RenderingSlotEditor';
import { SummaryEditor } from '../SummaryEditor';
import { sliceOptions } from '../SliceEditor';
import { UndescribedEditor } from '../UndescribedEditor';

const descriptor = (valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path: 'p', label: 'Prop', group: 'G', valueType, ...extra });
const draw = (editor: (props: never) => ReactNode, value: unknown, property: PropertyDescriptor, lookups: Partial<EditorLookups> = {}, extra: Partial<PropertyEditorProps<unknown>> = {}) =>
    renderToStaticMarkup(createElement(editor as unknown as (props: PropertyEditorProps<unknown>) => ReactNode, { id: 'pe', value, onChange: () => undefined, descriptor: property, context: anEditorContext(lookups), ...extra }));

describe('when drawing a navigation target', () => {
    const destinations = [{ id: 'orders', label: 'Orders', group: 'Sales › Orders' }, { id: 'invoices', label: 'Invoices', group: 'Sales' }];

    it('should show a breadcrumb when closed', () => draw(NavigationTargetEditor, 'orders', descriptor(PropertyValueType.String), { destinations }).should.contain('Sales › Orders › Orders'));
    it('should read the screen of a destination reference', () => draw(NavigationTargetEditor, { screen: 'invoices' }, descriptor(PropertyValueType.Destination), { destinations }).should.contain('Sales › Invoices'));
    it('should show an error chip for a target that is gone, and keep it', () =>
        draw(NavigationTargetEditor, 'gone', descriptor(PropertyValueType.String), { destinations }).should.contain('studio-editor-chip--error').and.contain('gone no longer exists'));
    it('should show no error for a target that resolves', () => draw(NavigationTargetEditor, 'orders', descriptor(PropertyValueType.String), { destinations }).should.not.contain('studio-editor-chip--error'));
});

describe('when drawing a rendering slot', () => {
    const slots = ['content', 'side'];

    it('should draw a chip for each slot of the template', () => draw(RenderingSlotEditor, 'side', descriptor(PropertyValueType.String), { slots }).should.contain('>content<').and.contain('>side<'));
    it('should mark the chosen slot on the diagram', () => draw(RenderingSlotEditor, 'side', descriptor(PropertyValueType.String), { slots }).should.contain('data-slot="side" data-chosen="true"'));
    it('should not mark the others', () => draw(RenderingSlotEditor, 'side', descriptor(PropertyValueType.String), { slots }).should.not.contain('data-slot="content" data-chosen'));
    it('should keep a stored slot the template no longer has', () => draw(RenderingSlotEditor, 'old', descriptor(PropertyValueType.String), { slots }).should.contain('>old<'));
    it('should say when the template has no slots', () => draw(RenderingSlotEditor, undefined, descriptor(PropertyValueType.String)).should.contain('The template has no slots'));

    it('should place the usual slots where they sit on a page', () => {
        slotRegion('header', slots).y.should.equal(0);
        slotRegion('side', slots).x.should.equal(0);
        slotRegion('content', slots).width.should.equal(0.5);
    });
    it('should give every other slot a distinct place', () => {
        const others = ['alpha', 'beta', 'gamma'];
        new Set(others.map(slot => slotRegion(slot, others).x)).size.should.equal(3);
    });
});

describe('when offering slices', () => {
    const slices = [
        { id: 'place', name: 'Place order', kind: 'StateChange', path: ['Sales', 'Ordering'] },
        { id: 'orders', name: 'Orders', kind: 'ReadModel', path: ['Sales', 'Ordering'] },
    ];
    const text = defaultPropertyEditorStrings;
    const options = sliceOptions({ slices, stateChangeSlices: [] }, ['StateChange'], text);

    it('should group the slices by module and feature', () => options.map(option => option.group).should.deep.equal(['Sales › Ordering', 'Sales › Ordering']));
    it('should let the accepted kind be chosen', () => (options[0].disabled === undefined).should.be.true);
    it('should list the others disabled with the reason', () => { options[1].disabled!.should.be.true; options[1].reason!.should.equal('Not a State Change'); });
    it('should list the ones that can be chosen first under their own heading, with the module at the right (p14-2)', () => { options[0].section!.should.equal('State Change slices'); options[0].trailing!.should.equal('Sales'); });
    it('should list the others under a heading of their own, with their kind at the right (p14-2)', () => { options[1].section!.should.equal('Not invokable from a button'); options[1].trailing!.should.equal('Read Model'); });
    it('should put the ones that can be chosen before those that cannot, whatever order they were given in', () => sliceOptions({ slices: [slices[1], slices[0]], stateChangeSlices: [] }, ['StateChange'], text).map(option => option.label).should.deep.equal(['Place order', 'Orders']));
    it('should accept every kind when the descriptor names none', () => sliceOptions({ slices, stateChangeSlices: [] }, undefined, text).every(option => option.disabled === undefined).should.be.true);
    it('should offer the state change slices the host lends when it has no list of every slice', () =>
        sliceOptions({ slices: [], stateChangeSlices: [{ id: 'a', name: 'A', origin: ['M'], inputs: [] }] }, ['StateChange'], text).should.deep.equal([{ value: 'a', label: 'A', group: 'M', section: 'State Change slices', trailing: 'M' }]));
});

describe('when drawing a list of slices in sections', () => {
    const slices = [
        { id: 'a', name: 'A', kind: 'StateChange', path: ['Sales', 'Orders'] },
        { id: 'b', name: 'B', kind: 'StateChange', path: ['Support', 'Tickets'] },
        { id: 'c', name: 'C', kind: 'StateView', path: ['Sales', 'Orders'] },
    ];
    const markup = renderToStaticMarkup(createElement(SearchableSelect, { id: 'x', options: sliceOptions({ slices, stateChangeSlices: [] }, ['StateChange'], defaultPropertyEditorStrings), value: undefined, onChange: () => undefined, inline: true, placeholder: '', emptyLabel: '', searchLabel: '' } as never));
    it('should head each section and name the module and feature inside it', () => { markup.should.contain('State Change slices').and.contain('Not invokable from a button'); (markup.match(/studio-editor-select__subgroup/g) ?? []).length.should.equal(3); });
});

describe('when drawing the mode of a region', () => {
    it('should show the three modes, the current one chosen', () => {
        const markup = draw(InheritanceModeEditor, 'extend', descriptor(PropertyValueType.String));
        markup.should.contain('>Inherit<').and.contain('>Extend<').and.contain('>Override<');
        (markup.match(/aria-checked="true"/g) ?? []).length.should.equal(1);
    });
    it('should say what the current mode does', () => draw(InheritanceModeEditor, 'override', descriptor(PropertyValueType.String)).should.contain('Replaces the items of the level above'));
    it('should inherit when no mode is stored', () => draw(InheritanceModeEditor, undefined, descriptor(PropertyValueType.String)).should.contain('Shows the items of the level above, unchanged.'));
});

describe('when offering fields', () => {
    const fields = [{ name: 'name', type: 'string' }, { name: 'age', type: 'int' }, { name: 'born', type: 'DateTimeOffset' }, { name: 'id', type: 'Guid' }];

    it('should classify the types by kind', () => [fieldKindOf('string'), fieldKindOf('int'), fieldKindOf('decimal?'), fieldKindOf('bool'), fieldKindOf('DateTimeOffset'), fieldKindOf('Guid')].should.deep.equal(['string', 'number', 'number', 'boolean', 'date', 'id']));
    it('should offer every field when the descriptor accepts any', () => fieldCandidates({ editorKind: 'field' }, { fields, availableSources: {} }).offered.length.should.equal(4));
    it('should offer only the kinds the descriptor accepts', () => fieldCandidates({ editorKind: 'field', editorOptions: { fieldKinds: ['number', 'date'] } }, { fields, availableSources: {} }).offered.map(field => field.name).should.deep.equal(['age', 'born']));
    it('should offer the values a binding can read for a binding path', () => fieldCandidates({ editorKind: 'bindingPath' }, { fields, availableSources: { 'row.id': 'Guid' } }).offered.should.deep.equal([{ name: 'row.id', type: 'Guid' }]));
});

describe('when filtering the options of a dropdown', () => {
    const options = [{ value: 'a', label: 'Orders', group: 'Sales' }, { value: 'b', label: 'Invoices', group: 'Sales' }, { value: 'c', label: 'Stock', group: 'Warehouse' }];

    it('should keep everything for an empty filter', () => filterOptions(options, '  ').length.should.equal(3));
    it('should match the label, ignoring case', () => filterOptions(options, 'ORD').map(option => option.value).should.deep.equal(['a']));
    it('should match the group', () => filterOptions(options, 'ware').map(option => option.value).should.deep.equal(['c']));
    it('should keep nothing for what nothing matches', () => filterOptions(options, 'zzz').should.deep.equal([]));
});

describe('when drawing the columns of a table', () => {
    const columns = [{ id: 'c1', field: 'name', header: 'Name', width: 120, align: 'end', format: 'text' }];
    const markup = draw(ColumnListEditor, columns, descriptor(PropertyValueType.Collection), { fields: [{ name: 'name', type: 'string' }] });

    it('should draw a row for each column with its header, width, alignment and format', () => markup.should.contain('value="Name"').and.contain('value="120"').and.contain('value="text"'));
    it('should draw the alignment as a choice with the current one selected', () => markup.should.match(/<option value="end" selected/));
    it('should offer adding a column', () => markup.should.contain('Add column'));
});

describe('when a property holds something nothing describes', () => {
    it('should say so instead of offering text to type JSON into', () => {
        const markup = draw(UndescribedEditor, { a: 1 }, descriptor(PropertyValueType.Json));
        markup.should.contain('role="alert"').and.contain('Prop');
        markup.should.not.contain('<textarea').and.not.contain('<input');
    });
});

describe('when a property is edited by a component\'s own editor', () => {
    it('should summarise what it holds and where it is edited, never as JSON', () => {
        const markup = draw(SummaryEditor, { columns: 2, gap: 8 }, descriptor(PropertyValueType.Object, { editorKind: 'commandFormLayout' }));
        markup.should.contain('columns, gap').and.contain('Edited in the Command form section');
        markup.should.not.contain('{').and.not.contain('<textarea');
    });
    it('should say when it holds nothing', () => draw(SummaryEditor, undefined, descriptor(PropertyValueType.Object, { editorKind: 'size' })).should.contain('Not set'));
});
