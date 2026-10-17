// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind, PropertyValueType, ToolbarEmphasis } from '@cratis/scene.model';
import { corePackage, coreDescriptors } from '../../index';
import { toolbarItemMode } from '../CoreToolbar';

describe('when describing the core package', () => {
    it('should describe components', () => {
        coreDescriptors.length.should.be.greaterThan(0);
    });

    it('should ship the descriptors in its bundle', () => {
        (corePackage.descriptors === coreDescriptors).should.be.true;
    });

    it('should give every layout-free component an author configures properties to edit', () => {
        coreDescriptors.filter(descriptor => descriptor.properties.length > 0).map(descriptor => descriptor.component)
            .should.have.members(['core:button', 'core:action', 'core:toolbarItem', 'core:sliceDialog', 'core:column', 'core:outlet', 'core:navigationBar']);
    });

    it('should describe every component of the package, the structural ones with nothing to edit', () => {
        coreDescriptors.map(descriptor => descriptor.component).should.have.members(corePackage.manifest.components.map(name => `core:${name}`));
    });

    it('should describe the navigation bar as an ordered collection of label, icon and destination', () => {
        const items = coreDescriptors.find(descriptor => descriptor.component === 'core:navigationBar')!.properties.find(property => property.path === 'items')!;
        items.valueType.should.equal(PropertyValueType.Collection);
        items.item!.properties.map(field => [field.path, field.valueType]).should.deep.equal([
            ['label', PropertyValueType.String], ['icon', PropertyValueType.Icon], ['destination', PropertyValueType.Destination],
        ]);
    });

    it('should describe an action\'s command and its argument mapping', () => {
        const action = coreDescriptors.find(descriptor => descriptor.component === 'core:action')!;
        action.properties.map(property => property.path).should.deep.equal(['label', 'command', 'arguments']);
        action.properties[2].valueType.should.equal(PropertyValueType.Collection);
    });

    it('should describe a toolbar button as a title, a state change slice, an emphasis and an icon', () => {
        const button = coreDescriptors.find(descriptor => descriptor.component === 'core:toolbarItem')!;
        button.properties.map(property => property.path).should.deep.equal(['label', 'slice', 'emphasis', 'icon', 'presentation', 'target']);

        const slice = button.properties.find(property => property.path === 'slice')!;
        slice.editorKind!.should.equal(PropertyEditorKind.Slice);
        slice.editorOptions!.kinds!.should.deep.equal(['StateChange']);

        const emphasis = button.properties.find(property => property.path === 'emphasis')!;
        emphasis.valueType.should.equal(PropertyValueType.Enum);
        emphasis.choices!.map(choice => choice.value).should.deep.equal([ToolbarEmphasis.Primary, ToolbarEmphasis.Secondary, ToolbarEmphasis.Quiet]);
        (emphasis.default as string).should.equal(ToolbarEmphasis.Secondary);
    });

    it('should describe a toolbar item\'s presentation as the hints the toolbar reads, keeping the ones it does not describe', () => {
        const presentation = coreDescriptors.find(descriptor => descriptor.component === 'core:toolbarItem')!.properties.find(property => property.path === 'presentation')!;
        presentation.valueType.should.equal(PropertyValueType.Object);
        presentation.open!.should.be.true;
        presentation.properties!.map(field => field.path).should.deep.equal(['mode', 'placement']);
        presentation.properties![0].choices!.map(choice => choice.value).should.deep.equal(['both', 'icon', 'text']);
    });

    it('should offer, as modes of presentation, exactly the ones the toolbar renders', () => {
        const modes = coreDescriptors.find(descriptor => descriptor.component === 'core:toolbarItem')!.properties.find(property => property.path === 'presentation')!.properties![0].choices!.map(choice => choice.value);
        modes.map(mode => toolbarItemMode({ mode })).should.deep.equal(['both', 'icon', 'text']);
    });
});
