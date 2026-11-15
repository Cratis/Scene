// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { destinationProblems, isValidRoute, type DestinationTargets } from '../destinationProblems';
import { DestinationProblemKind } from '../DestinationProblemKind';

const targets: DestinationTargets = { screens: ['Orders'], slots: ['details'], dialogTemplates: ['OrderDialog'], slices: ['register-order'] };

describe('when checking a destination that leads somewhere known', () => {
    it('should find nothing wrong', () => destinationProblems({ screen: 'Orders', route: '/orders/:orderId', slot: 'details', kind: DestinationKind.Slot }, targets).should.be.empty);
});

describe('when checking no destination', () => {
    it('should find nothing wrong', () => destinationProblems(undefined, targets).should.be.empty);
});

describe('when checking a destination that leads nowhere', () => {
    it('should say so', () => destinationProblems({ slot: 'details' }, targets).should.deep.equal([DestinationProblemKind.NoTarget]));
});

describe('when checking a destination that names what does not exist', () => {
    const problems = destinationProblems({ screen: 'Invoices', slot: 'sidebar', dialog: 'Missing', slice: 'gone' }, targets);

    it('should name the unknown screen', () => problems.should.contain(DestinationProblemKind.UnknownScreen));
    it('should name the unknown slot', () => problems.should.contain(DestinationProblemKind.UnknownSlot));
    it('should name the unknown dialog', () => problems.should.contain(DestinationProblemKind.UnknownDialog));
    it('should name the unknown slice', () => problems.should.contain(DestinationProblemKind.UnknownSlice));
});

describe('when checking a destination whose kind lacks what it needs', () => {
    it('should want a slot for a slot', () => destinationProblems({ screen: 'Orders', kind: DestinationKind.Slot }, targets).should.deep.equal([DestinationProblemKind.SlotKindWithoutSlot]));
    it('should want a dialog for a dialog', () => destinationProblems({ screen: 'Orders', kind: DestinationKind.Dialog }, targets).should.deep.equal([DestinationProblemKind.DialogKindWithoutDialog]));
    it('should want a route to leave to', () => destinationProblems({ screen: 'Orders', kind: DestinationKind.External }, targets).should.deep.equal([DestinationProblemKind.ExternalKindWithoutRoute]));
});

describe('when checking routes', () => {
    it('should accept an absolute path with parameters', () => isValidRoute('/orders/:orderId/lines/:lineId').should.be.true);
    it('should refuse a relative path', () => isValidRoute('orders/:id').should.be.false);
    it('should refuse a parameter named twice', () => isValidRoute('/orders/:id/lines/:id').should.be.false);
    it('should refuse a parameter without a name', () => isValidRoute('/orders/:').should.be.false);
    it('should refuse whitespace', () => isValidRoute('/orders/ :id').should.be.false);
    it('should accept a web address for an external destination', () => isValidRoute('https://example.com/help', DestinationKind.External).should.be.true);
    it('should refuse a path for an external destination', () => isValidRoute('/help', DestinationKind.External).should.be.false);
});
