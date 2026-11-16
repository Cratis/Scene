// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, type ApplicationStructure, type Screen } from '@cratis/scene.model';
import { moduleOfDestination, moduleSectionsPackOf } from '../moduleSections';

const structure = {
    modules: [
        { id: 'Sales', name: 'Sales', features: [{ id: 'Sales.Orders', name: 'Orders', features: [], slices: [] }], slices: [] },
        { id: 'Support', name: 'Support', features: [{ id: 'Support.Tickets', name: 'Tickets', features: [], slices: [] }, { id: 'Support.KnowledgeBase', name: 'Knowledge base', features: [], slices: [] }], slices: [] },
    ],
} as ApplicationStructure;
const screens = [
    { name: 'OrderScreen', path: ['Sales', 'Orders'] },
    { name: 'TicketScreen', path: ['Support', 'Tickets'] },
    { name: 'Admin__Dashboard', owner: 'Support.KnowledgeBase.Dashboard' },
] as Screen[];

describe('when the preview navigates to another module', () => {
    // The preview was started from the Sales module, and the shell moved to a screen of Support.
    const module = moduleOfDestination(screens, { kind: DestinationKind.Slot, screen: 'TicketScreen' })!;
    const pack = moduleSectionsPackOf(structure, module, [])!;

    it('should find the module of the screen it moved to', () => module.should.equal('Support'));
    it('should supply the sections of that module', () => pack.sets[0].rows.map(row => row.label).should.deep.equal(['Tickets', 'Knowledge base']));
    it('should find the module of a screen the document places by its owner', () => moduleOfDestination(screens, { screen: 'Admin__Dashboard' })!.should.equal('Support'));
    it('should take the module a destination names', () => moduleOfDestination(screens, { module: 'Sales' })!.should.equal('Sales'));
    it('should not say for a dialog', () => (moduleOfDestination(screens, { kind: DestinationKind.Dialog, dialog: 'NewTicket' }) === undefined).should.be.true);
    it('should not say for a screen the document does not have', () => (moduleOfDestination(screens, { screen: 'Unknown' }) === undefined).should.be.true);
});
