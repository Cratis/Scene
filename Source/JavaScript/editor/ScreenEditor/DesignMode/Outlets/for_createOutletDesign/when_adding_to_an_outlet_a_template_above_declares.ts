// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveOutlet } from '@cratis/scene.engine';
import { OutletItemKind, OutletKind, type SceneDocument, type ScreenTemplate } from '@cratis/scene.model';
import { defaultOutletStrings } from '../OutletStrings';
import { chainAt } from '../../../Outlets/screenOutletChain';
import { screenOutletsOf } from '../screenOutlets';
import { carryOut, queries, screen } from '../given/productCatalog';

// A list screen as the Screenplay stores it: it names `ListScreen`, a blueprint's template the document does not carry, whose `toolbar` outlet the screen
// puts its button in (`toolbar actions` holding a hook button).
const listScreen: ScreenTemplate = {
    name: 'ListScreen',
    slots: [{ name: 'content' }],
    outlets: [{ name: 'toolbar', kind: OutletKind.Actions, defaults: [{ kind: OutletItemKind.Button, id: 'refresh', title: 'Refresh' }] }],
};

const stored = {
    layouts: [{ name: 'StudioScreen', slots: [{ name: 'content' }] }],
    screenTemplates: [],
    dialogTemplates: [],
    screens: [{ name: screen, layout: 'StudioScreen', screenTemplate: 'ListScreen', slotContent: {}, forms: [], contributions: [] }],
    exposures: [],
    instanceContributions: [],
} as unknown as SceneDocument;

const outletsOf = (document: SceneDocument) => screenOutletsOf({ document, catalog: { components: [] } as never, templates: [listScreen], queries, screens: [], strings: defaultOutletStrings });

// What the surface draws for an outlet: Scene's effective outlet of the chain at the level being edited, as ScreenSurface hands it to the outlet component.
const drawnTitles = (document: SceneDocument, outlet: string): string[] => {
    const outlets = outletsOf(document);
    const scoped = chainAt(outlets.outlets, outlets.level);
    return effectiveOutlet(scoped.chain, outlet, scoped.contributors).items.map(item => String((item.item as { title?: string }).title));
};

describe('when adding a button to the toolbar a template the document does not carry declares', () => {
    const before = outletsOf(stored);
    const plan = before.design('toolbar')!.add('addButton');
    const after = carryOut(stored, plan);

    it('should edit the toolbar at the screen', () => before.level!.name.should.equal(screen));
    it('should draw the template\'s own button before the change', () => drawnTitles(stored, 'toolbar').should.deep.equal(['Refresh']));
    it('should draw the added button after the template\'s own', () => drawnTitles(after, 'toolbar').should.deep.equal(['Refresh', 'New button']));
    it('should list it among the items the design shows', () => outletsOf(after).design('toolbar')!.items.map(item => item.label).should.deep.equal(['Refresh', 'New button']));
});
