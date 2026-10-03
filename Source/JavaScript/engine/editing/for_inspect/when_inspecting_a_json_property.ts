// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType, SceneDocument, ValueSource } from '@cratis/scene.model';
import { createDescriptorCatalog, inspect } from '../index';
import { component } from '../given/a_scene_document';
import { createLayoutDocument, homeContext } from '../given/a_layout_document';

const jsonDescriptor: ComponentDescriptor = {
    component: 'test:json',
    properties: [
        { path: 'data', label: 'Data', group: 'Data', valueType: PropertyValueType.Json, default: { fallback: true } },
        { path: 'title', label: 'Title', group: 'Data', valueType: PropertyValueType.String, default: 'Untitled' },
    ],
};

function inspectWith(properties: Record<string, unknown>) {
    const document: SceneDocument = createLayoutDocument();
    document.screens[0].slotContent = { side: [component('j', 'test:json', properties)] };
    const context = homeContext({ catalog: createDescriptorCatalog([jsonDescriptor]) });
    const inspection = inspect(document, 'element:j', context)!;
    return (path: string) => inspection.properties.find(property => property.descriptor.path === path)!;
}

describe('when inspecting a json property', () => {
    describe('that holds an explicit null', () => {
        const data = inspectWith({ data: null })('data');

        it('should show null as the effective value instead of the default', () => {
            (data.effectiveValue === null).should.be.true;
        });

        it('should keep the stored null as the current value', () => {
            (data.currentValue === null).should.be.true;
        });

        it('should say the value is stored locally, not defaulted', () => {
            data.source.should.equal(ValueSource.Local);
        });
    });

    describe('that was never set', () => {
        const data = inspectWith({})('data');

        it('should show the default as the effective value', () => {
            (data.effectiveValue as { fallback: boolean }).should.deep.equal({ fallback: true });
        });

        it('should say the value is the default, which tells it apart from a stored null', () => {
            data.source.should.equal(ValueSource.Default);
        });
    });

    describe('of another type that holds an explicit null', () => {
        const title = inspectWith({ title: null })('title');

        it('should keep falling back to the default, as before', () => {
            (title.effectiveValue as string).should.equal('Untitled');
        });
    });
});
