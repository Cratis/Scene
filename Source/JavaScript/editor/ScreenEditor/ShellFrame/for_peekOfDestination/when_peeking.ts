// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { canPeek, peekNameOf } from '../peekOfDestination';

describe('when the shell navigates to a screen', () => {
    const destination = { kind: DestinationKind.Slot, screen: 'Customers' };

    it('should be named by the screen', () => peekNameOf(destination).should.equal('Customers'));
    it('should be peekable', () => canPeek(destination).should.be.true);
});

describe('when the shell navigates to a dialog', () => {
    it('should not be peekable, a dialog opens over a screen', () => canPeek({ kind: DestinationKind.Dialog, dialog: 'Confirm' }).should.be.false);
});

describe('when the shell navigates to an external link', () => {
    it('should not be peekable', () => canPeek({ kind: DestinationKind.External, screen: 'https://example.com' }).should.be.false);
});

describe('when the shell navigates nowhere', () => {
    it('should not be peekable', () => canPeek({ kind: DestinationKind.Slot }).should.be.false);
});
