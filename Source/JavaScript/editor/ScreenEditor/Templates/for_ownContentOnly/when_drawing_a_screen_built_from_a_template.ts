// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import type { EditorComposition } from '../composeEditorScreen';
import { ownContentOnly } from '../ownContentOnly';

const chrome = createPanel(LayoutItem.Stack, 'template-header', 'Header', []);
const configurable = createPanel(LayoutItem.Stack, 'template-nav', 'Nav', []);
const own = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', []);
const filled = createPanel(LayoutItem.Stack, 'screen-header-content', 'Title', []);
const composition: EditorComposition = {
    element: createPanel(LayoutItem.Stack, 'composition', 'Composition', [chrome, configurable, own, filled]),
    roots: [chrome, configurable, own, filled],
    own: [own, filled],
    chrome: [],
    templates: ['Workspace'],
};

describe('when drawing a screen built from a template', () => {
    const element = ownContentOnly(composition);
    const ids = (element.children ?? []).map(child => (child as { id: string }).id);

    it('should draw what the screen itself authored', () => ids.should.include('screen-root'));
    it('should draw what the screen put into the slots of its template', () => ids.should.include('screen-header-content'));
    it('should not draw what the template puts around it', () => ids.should.not.include('template-header'));
    it('should not draw what the template lets the screen configure either', () => ids.should.not.include('template-nav'));
    it('should keep the composition id so the surface still finds it', () => (element as { id: string }).id.should.equal('composition'));
});

describe('when drawing a screen that has no template', () => {
    const plain: EditorComposition = { element: createPanel(LayoutItem.Stack, 'composition', 'Composition', [own]), roots: [own], own: [own], chrome: [], templates: [] };

    it('should draw the composition as it is', () => ownContentOnly(plain).should.equal(plain.element));
});
