// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Layout, ScreenTemplate, SceneDocument } from '@cratis/scene.model';
import { createScreenDocument } from '../../Document/studioScreen';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { detailShowsOf, routedSlotsOf, screenplayNameOf, showText, withDetailShow } from '../detailShows';

const document = (): SceneDocument => createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', []));
const withTemplate = (base: SceneDocument): SceneDocument => ({ ...base, screens: base.screens.map(screen => ({ ...screen, screenTemplate: 'CatalogPage' })) });

describe('when filling a routed slot from a selection', () => {
    const filled = withDetailShow(document(), 'detail', { screen: 'ProductDetails', by: 'sku', element: 'productstable' });

    it('should say it as the Screenplay line', () => showText({ screen: 'ProductDetails', by: 'sku', element: 'productstable' }).should.equal('show ProductDetails by sku from productstable.selection'));
    it('should keep it under the slot', () => detailShowsOf(filled).should.deep.equal([{ slot: 'detail', screen: 'ProductDetails', by: 'sku', element: 'productstable' }]));
    it('should keep it natively beside the typed elements of the slot', () => (filled.screens[0] as unknown as { native: { slots: { detail: { at: number }[] } } }).native.slots.detail[0].at.should.equal(0));
    it('should replace what the slot showed before', () => detailShowsOf(withDetailShow(filled, 'detail', { screen: 'Other', by: 'sku', element: 'productstable' })).map(show => show.screen).should.deep.equal(['Other']));
    it('should leave the slot as it was when nothing is chosen', () => detailShowsOf(withDetailShow(filled, 'detail', undefined)).should.deep.equal([]));
    it('should leave nothing native behind when nothing is chosen', () => ('native' in withDetailShow(filled, 'detail', undefined).screens[0]).should.be.false);
    it('should not touch a document it was not asked about', () => withDetailShow(document(), 'detail', undefined).should.deep.equal(document()));
});

describe('when naming a component the way Screenplay does', () => {
    it('should leave out what is not a letter, a digit or an underscore', () => screenplayNameOf('products-table').should.equal('productstable'));
    it('should not start with a digit', () => screenplayNameOf('1-table').should.equal('_1table'));
    it('should keep a name that is an identifier', () => screenplayNameOf('rows_2').should.equal('rows_2'));
});

describe('when asking which slots a selection can fill', () => {
    const template: ScreenTemplate = { name: 'CatalogPage', slots: [{ name: 'content', routed: true }, { name: 'detail', routed: true, routedBy: ['sku'] }, { name: 'aside' }] };
    const layout: Layout = { name: 'StudioScreen', slots: [{ name: 'content' }] };

    it('should list the routed slots that say what they are addressed by', () => routedSlotsOf(withTemplate(document()), [template], [layout]).should.deep.equal([{ name: 'detail', routedBy: ['sku'] }]));
    it('should list none for a screen that fills only the content slot of its layout', () => routedSlotsOf(document(), [template], [layout]).should.deep.equal([]));
});
