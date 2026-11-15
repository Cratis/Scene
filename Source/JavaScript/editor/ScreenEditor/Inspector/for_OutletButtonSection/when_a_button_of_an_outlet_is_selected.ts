// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementNodeId, inspect } from '@cratis/scene.engine';
import type { InspectedProperty, PropertyDescriptor, SceneDocument } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { defaultDesignModeStrings } from '../../DesignMode/DesignModeStrings';
import { button, context, toolbarScreen } from '../../DesignMode/for_resolveDesignMode/given_a_screen_with_a_toolbar';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import { anEditorContext } from '../../PropertyEditors/Registry/for_PropertyEditorRegistry/given/anEditorContext';
import { createPropertyEditorRegistry } from '../../PropertyEditors/Registry/createPropertyEditorRegistry';
import { OutletButtonSection } from '../OutletButtonSection';
import type { ScreenEditorStrings } from '../ScreenEditorStrings';

const itemsOf = (document: SceneDocument): InspectedProperty => inspect(document, elementNodeId('toolbar'), context())!.properties.find(property => property.descriptor.path === 'items')!;

async function rendered(document: SceneDocument, selectedItemId: string, strings: ScreenEditorStrings = defaultScreenEditorStrings): Promise<string> {
    const registry = createPropertyEditorRegistry();
    const items = itemsOf(document);
    for (const field of items.descriptor.item?.properties ?? []) {
        const resolution = registry.resolve(field as PropertyDescriptor);
        if (resolution) await registry.load(resolution.id);
    }
    const controller = { structure: { modules: [] }, selectedItemId, applyAll: () => ({ applied: true, diagnostics: [] }) } as unknown as ScreenEditorController;
    return renderToStaticMarkup(createElement(OutletButtonSection, { controller, strings, componentId: 'toolbar', items, registry, context: anEditorContext() }));
}

const refresh = () => button('b1', 'Refresh', { icon: { library: 'Acme.Icons', key: 'refresh' } });

describe('when a button of an outlet is selected', () => {
    let markup = '';
    beforeAll(async () => { markup = await rendered(toolbarScreen([refresh()]), 'b1'); });

    it('should draw what it shows as a group of choices named Shows', () => markup.should.match(/<label id="([^"]+)-label"[^>]*>Shows<\/label>.*role="radiogroup" aria-labelledby="\1-label"/s));
    it('should offer icon and title, icon only and title only', () => ['Icon and title', 'Icon only', 'Title only'].forEach(choice => markup.should.contain(`>${choice}</button>`)));
    it('should draw each choice as a radio a keyboard reaches', () => (markup.match(/<button type="button" role="radio"/g) ?? []).length.should.be.at.least(3));
    it('should say a button that says nothing shows its icon and title', () => markup.should.match(/role="radio" aria-checked="true"[^>]*>Icon and title<\/button>/));
    it('should say an icon-only button keeps its title as its accessible name', () => markup.should.contain(defaultDesignModeStrings.toolbar.showsHelp));
});

describe('when a button that shows only its icon is selected', () => {
    let markup = '';
    beforeAll(async () => { markup = await rendered(toolbarScreen([button('b1', 'Refresh', { icon: { library: 'Acme.Icons', key: 'refresh' }, display: 'icon' })]), 'b1'); });

    it('should read back icon only as chosen', () => markup.should.match(/role="radio" aria-checked="true"[^>]*>Icon only<\/button>/));
});

describe('when the editor speaks another language', () => {
    let markup = '';
    beforeAll(async () => {
        const toolbar = { ...defaultDesignModeStrings.toolbar, shows: 'Viser', showsHelp: 'Hjelp', displays: { iconAndTitle: 'Ikon og tittel', icon: 'Bare ikon', title: 'Bare tittel' } };
        markup = await rendered(toolbarScreen([refresh()]), 'b1', { ...defaultScreenEditorStrings, designMode: { ...defaultDesignModeStrings, toolbar } });
    });

    it('should name the choices in its words', () => markup.should.contain('>Viser</label>').and.contain('>Bare ikon</button>').and.not.contain('>Icon only</button>'));
});
