// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { DestinationGroup, type ListedDestination } from '@cratis/scene.blueprint.default';
import { destinationLabel, sameDestination } from '../destinationLabel';

const customers = { kind: DestinationKind.Slot, screen: 'Customers' };
const listed: ListedDestination[] = [{ id: 'page:Customers', label: 'Master/detail', group: DestinationGroup.Pages, destination: customers }];

describe('when the destination is listed', () => {
    it('should be named as the picker names it', () => destinationLabel({ kind: DestinationKind.Slot, screen: 'Customers' }, listed).should.equal('Master/detail'));
});

describe('when the destination is not listed', () => {
    it('should be named by its screen', () => destinationLabel({ kind: DestinationKind.Slot, screen: 'Other' }, listed).should.equal('Other'));
});

describe('when comparing a screen and a dialog of the same name', () => {
    it('should tell them apart', () => sameDestination({ kind: DestinationKind.Slot, screen: 'Confirm' }, { kind: DestinationKind.Dialog, dialog: 'Confirm' }).should.be.false);
});

describe('when comparing two references to the same screen', () => {
    it('should tell they are the same', () => sameDestination(customers, { kind: DestinationKind.Slot, screen: 'Customers' }).should.be.true);
});
