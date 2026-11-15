// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, screenRootId } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { thumbnailContent } from '../thumbnailContent';

const external = (id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as SceneElement;

const screen = (...children: SceneElement[]) => {
    const root = createPanel(LayoutItem.Stack, screenRootId, 'Screen');
    (root as unknown as { children: SceneElement[] }).children = children;
    return createScreenDocument(root);
};

describe('when listing what a screen shows', () => {
    const content = thumbnailContent(screen(
        external('nav', 'navigationBar', { items: [{ id: 'h', label: 'Home' }, { id: 's', label: 'Section' }] }),
        external('go', 'button', { label: 'Do Stuff' }),
        external('c', 'code', { code: 'const answer = 42;', language: 'ts' }),
        external('nav2', 'navigationBar', { items: [{ id: 'x', label: 'Elsewhere' }] }),
    ));

    it('should list the components in order, repeats included', () => content.components.should.deep.equal(['navigationBar', 'button', 'code', 'navigationBar']));
    it('should list the label of each item of a navigation bar', () => content.texts.should.include.members(['Home', 'Section', 'Elsewhere']));
    it('should list the text a button and a code block show', () => content.texts.should.include.members(['Do Stuff', 'const answer = 42;']));
    it('should not list what a person does not read', () => content.texts.should.not.include('ts'));
});

describe('when a component sits inside another', () => {
    const content = thumbnailContent(screen(external('card', 'card', { title: 'Outer' }, { body: [external('t', 'text', { text: 'Inner' })] })));

    it('should list both', () => { content.components.should.deep.equal(['card', 'text']); content.texts.should.deep.equal(['Outer', 'Inner']); });
});

describe('when the screen is empty', () => {
    it('should list nothing', () => thumbnailContent(screen()).should.deep.equal({ components: [], texts: [] }));
});
