// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, ExternalComponent, Panel, SceneElement } from '@cratis/scene.model';
import { applyEffectiveConfiguration } from '../index';
import { component, createExposedDocument } from '../given/a_scene_document';
import { resolve, scalar } from '../for_resolveEffectiveConfiguration/given/resolution';

describe('when applying configuration to an element tree', () => {
    const document = createExposedDocument();
    document.instanceContributions.push(scalar('template:Feature', 'title', 'Billing'));
    const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

    const navbar = document.screenTemplates[0].content!.chrome[0];
    const other = component('other', 'test:table');
    const tree = { id: 'wrapper', properties: {}, children: [navbar, other] } as unknown as Panel;
    const result = applyEffectiveConfiguration(tree as SceneElement, configuration) as Panel;

    it('should give the configurable component its resolved properties', () => {
        ((result.children[0] as ExternalComponent).properties.title as string).should.equal('Billing');
    });

    it('should leave a component with nothing to change as the same object', () => {
        (result.children[1] === other).should.be.true;
    });

    it('should not change the tree it was given', () => {
        ((tree.children[0] as ExternalComponent).properties.title === undefined).should.be.true;
    });

    it('should return the same tree when nothing in it is configurable', () => {
        const untouched = { id: 'solo', properties: {}, children: [other] } as unknown as Panel;
        (applyEffectiveConfiguration(untouched as SceneElement, configuration) === untouched).should.be.true;
    });

    it('should reach components inside another component\'s slots', () => {
        const wrapper = component('slotted', 'test:table', {}, { content: [navbar] });
        const applied = applyEffectiveConfiguration(wrapper, configuration) as ExternalComponent;
        ((applied.slots.content[0] as ExternalComponent).properties.title as string).should.equal('Billing');
    });
});
