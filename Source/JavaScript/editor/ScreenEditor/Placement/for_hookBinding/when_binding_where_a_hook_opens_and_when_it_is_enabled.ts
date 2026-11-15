// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletSubject, ScreenFit, SlotRole } from '@cratis/scene.model';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { enabledChangeOf, enabledChipText, opensChangeOf, opensChipText, opensValueOf } from '../hookBinding';
import type { PlacementEnvironment } from '../hookPlacement';
import { opensChoicesFor, routeText } from '../opensOptions';

const price: StateChangeSlice = {
    id: 'slice-price', name: 'SetPrice', commandName: 'SetPrice', origin: ['Shop'], fits: [ScreenFit.Drawer, ScreenFit.Dialog],
    inputs: [{ name: 'orderId', type: 'Guid', required: true }, { name: 'price', type: 'number', required: true }],
};
const environment: PlacementEnvironment = {
    slices: [price],
    slots: [{ name: 'detail', role: SlotRole.Pane, filled: false, routed: true, routedBy: ['orderId'] }],
    itemFields: new Set(['orderId']),
    routeParameters: [],
};

describe('when the way a hook opens is chosen', () => {
    it('should store automatic as nothing', () => (opensChangeOf('automatic') as object).should.deep.equal({ opens: undefined, opensIn: undefined }));
    it('should store a drawer', () => (opensChangeOf('drawer') as object).should.deep.equal({ opens: Opens.Drawer, opensIn: undefined }));
    it('should store run directly', () => (opensChangeOf('none') as object).should.deep.equal({ opens: Opens.None, opensIn: undefined }));
    it('should store a slot with its name', () => (opensChangeOf('slot:detail') as object).should.deep.equal({ opens: Opens.Slot, opensIn: 'detail' }));
    it('should read the value an editor hands back with its hook', () => (opensChangeOf({ value: 'dialog', hook: {} }) as object).should.deep.equal({ opens: Opens.Dialog, opensIn: undefined }));
    it('should refuse a way that does not exist', () => (opensChangeOf('popup') === undefined).should.be.true);
    it('should carry a slot in the one value', () => opensValueOf(Opens.Slot, 'detail').should.equal('slot:detail'));
    it('should carry automatic when nothing is said', () => opensValueOf(undefined, undefined).should.equal('automatic'));
});

describe('when what a hook acts on and when it is enabled are chosen', () => {
    it('should store both', () => (enabledChangeOf({ subject: 'item', enabledWhen: ' item.stock > 0 ' }) as object).should.deep.equal({ subject: OutletSubject.Item, enabledWhen: 'item.stock > 0' }));
    it('should clear a blank condition', () => (enabledChangeOf({ subject: 'screen', enabledWhen: '  ' }) as object).should.deep.equal({ subject: OutletSubject.Screen, enabledWhen: undefined }));
    it('should clear a subject that does not exist', () => (enabledChangeOf({ subject: 'galaxy' }) as object).should.deep.equal({ subject: undefined, enabledWhen: undefined }));
});

describe('when the Opens chip of a hook is worded', () => {
    it('should say where automatic works out to', () => opensChipText({ slice: price.id, subject: OutletSubject.Item }, environment).should.equal('Automatic · Drawer'));
    it('should name what was chosen', () => opensChipText({ slice: price.id, opens: Opens.Dialog }, environment).should.equal('Dialog'));
    it('should name the slot', () => opensChipText({ slice: price.id, opens: Opens.Slot, opensIn: 'detail' }, environment).should.equal('In detail'));
    it('should say only automatic before a slice is chosen', () => opensChipText({}, environment).should.equal('Automatic'));
});

describe('when the Enabled chip of a hook is worded', () => {
    it('should say always when nothing limits it', () => enabledChipText({ subject: OutletSubject.Screen }, undefined).should.equal('Always'));
    it('should say it is for an item', () => enabledChipText({ subject: OutletSubject.Item }, undefined).should.equal('For item'));
    it('should take the subject of the outlet when the hook says none', () => enabledChipText({}, OutletSubject.Item).should.equal('For item'));
    it('should add the condition', () => enabledChipText({ subject: OutletSubject.Item, enabledWhen: 'item.stock > 0' }, undefined).should.equal('For item · when item.stock > 0'));
});

describe('when the choices of a hook that needs a value nothing supplies are listed', () => {
    const choices = opensChoicesFor({ slice: price.id, subject: OutletSubject.Item }, environment);
    const option = (value: Opens) => choices.options.find(candidate => candidate.value === value)!;

    it('should list the five ways', () => choices.options.map(candidate => candidate.value).should.deep.equal([Opens.Automatic, Opens.None, Opens.Dialog, Opens.Drawer, Opens.Slot]));
    it('should grey run directly', () => option(Opens.None).available.should.be.false);
    it('should say the input that has no source', () => option(Opens.None).reason.should.contain('price'));
    it('should leave the drawer the slice fits', () => option(Opens.Drawer).available.should.be.true);
    it('should grey the dialog the slice does not fit', () => option(Opens.Dialog).available.should.be.true);
    it('should list the slots with whether the slice can go in', () => choices.slots.map(slot => slot.name).should.deep.equal(['detail']));
});

describe('when a routed slot is offered', () => {
    const pane: StateChangeSlice = { ...price, fits: [ScreenFit.Pane] };
    const choices = opensChoicesFor({ slice: pane.id, subject: OutletSubject.Item, opens: Opens.Slot }, { ...environment, slices: [pane] });
    const slot = choices.slots.find(candidate => candidate.name === 'detail')!;

    it('should be offered', () => slot.offered.should.be.true);
    it('should say the URL it makes of the opening', () => routeText(slot.route!).should.contain('/'));
});
