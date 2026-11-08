// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletButtonDisplay, OutletKind, PropertyEditorKind, PropertyValueType, ToolbarEmphasis } from '@cratis/scene.model';
import { corePackage, coreDescriptors } from '../../index';

describe('when describing the core package', () => {
    it('should describe components', () => {
        coreDescriptors.length.should.be.greaterThan(0);
    });

    it('should ship the descriptors in its bundle', () => {
        (corePackage.descriptors === coreDescriptors).should.be.true;
    });

    it('should give every layout-free component an author configures properties to edit', () => {
        coreDescriptors.filter(descriptor => descriptor.properties.length > 0).map(descriptor => descriptor.component)
            .should.have.members(['core:button', 'core:action', 'core:guarded-action', 'core:outletItems', 'core:sliceDialog', 'core:column', 'core:slot', 'core:navigationBar']);
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

    it('should describe an action\'s command, its argument mapping, where it opens, its subject and when it is enabled', () => {
        const action = coreDescriptors.find(descriptor => descriptor.component === 'core:action')!;
        action.properties.map(property => property.path).should.deep.equal(['label', 'command', 'arguments', 'opens', 'opensIn', 'subject', 'enabledWhen']);
        action.properties[2].valueType.should.equal(PropertyValueType.Collection);
    });

    it('should offer the Opens choices an outlet\'s actions have, opening automatically by default', () => {
        const opens = coreDescriptors.find(descriptor => descriptor.component === 'core:action')!.properties.find(property => property.path === 'opens')!;
        opens.default!.should.equal(Opens.Automatic);
        opens.choices!.map(choice => choice.value).should.deep.equal(Object.values(Opens));
    });

    it('should describe the guarded action without changing the ordinary action descriptor', () => {
        const action = coreDescriptors.find(descriptor => descriptor.component === 'core:guarded-action')!;
        action.properties.map(property => property.path).should.deep.equal(['label', 'item', 'alternatives', 'otherwise', 'navigateToScreen', 'navigateByParameter']);
    });

    it('should describe an outlet as its name, kind, subject, slot, selected item and items', () => {
        const outlet = coreDescriptors.find(descriptor => descriptor.component === 'core:outletItems')!;
        outlet.properties.map(property => property.path).should.deep.equal(['name', 'kind', 'subject', 'slot', 'item', 'items']);
        outlet.properties.find(property => property.path === 'kind')!.choices!.map(choice => choice.value)
            .should.deep.equal([OutletKind.Actions, OutletKind.Filters, OutletKind.Tabs, OutletKind.Stats, OutletKind.Navigation]);
    });

    it('should describe an outlet item as a title, a state change slice, an emphasis, an icon, what it shows, a confirmation and where it opens', () => {
        const items = coreDescriptors.find(descriptor => descriptor.component === 'core:outletItems')!.properties.find(property => property.path === 'items')!;
        items.item!.properties.map(property => property.path).should.deep.equal(['id', 'title', 'slice', 'emphasis', 'icon', 'display', 'confirm', 'opens', 'opensIn', 'subject', 'enabledWhen']);

        const slice = items.item!.properties.find(property => property.path === 'slice')!;
        slice.editorKind!.should.equal(PropertyEditorKind.Slice);
        slice.editorOptions!.kinds!.should.deep.equal(['StateChange']);

        const emphasis = items.item!.properties.find(property => property.path === 'emphasis')!;
        emphasis.valueType.should.equal(PropertyValueType.Enum);
        emphasis.choices!.map(choice => choice.value).should.deep.equal([ToolbarEmphasis.Primary, ToolbarEmphasis.Secondary, ToolbarEmphasis.Quiet]);
        (emphasis.default as string).should.equal(ToolbarEmphasis.Secondary);

        const display = items.item!.properties.find(property => property.path === 'display')!;
        display.valueType.should.equal(PropertyValueType.Enum);
        display.choices!.map(choice => choice.value).should.deep.equal([OutletButtonDisplay.IconAndTitle, OutletButtonDisplay.Icon, OutletButtonDisplay.Title]);
        (display.default as string).should.equal(OutletButtonDisplay.IconAndTitle);
    });
});
