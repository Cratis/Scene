// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { undo } from '../../Session/EditSession';
import { carryOut, designModeFor, labelsOf, toolbarScreen } from './given_a_screen_with_a_toolbar';

describe('when "+" adds a button', () => {
    const document = toolbarScreen();
    const { session, plan } = carryOut(document, designModeFor(document, 'toolbar')!.source.add('addButton'));
    it('should add it last, titled Button (TB1)', () => labelsOf(session.document).should.deep.equal(['New order', 'Cancel order', 'Close', 'Button']));
    it('should select the new button and open its title for typing', () => { plan.select!.itemId!.should.match(/^new-/); plan.renameNext!.should.be.true; });
    it('should be one undo step', () => { session.undoable.should.have.length(1); labelsOf(undo(session).document).should.have.length(3); });
    it('should leave the button without a slice, which is flagged (TB5)', () => designModeFor(session.document, 'toolbar', plan.select!.itemId!)!.selected!.unlinked.should.be.true);
});

describe('when a button moves later', () => {
    const document = toolbarScreen();
    const subject = designModeFor(document, 'toolbar', 'b1')!;
    const { session } = carryOut(document, subject.source.act('moveLater', subject.selected!));
    it('should swap places with the next button', () => labelsOf(session.document).should.deep.equal(['Cancel order', 'New order', 'Close']));
    it('should be undoable', () => labelsOf(undo(session).document).should.deep.equal(['New order', 'Cancel order', 'Close']));
});

describe('when a button moves earlier', () => {
    const document = toolbarScreen();
    const subject = designModeFor(document, 'toolbar', 'b3')!;
    it('should swap places with the previous button', () => labelsOf(carryOut(document, subject.source.act('moveEarlier', subject.selected!)).session.document).should.deep.equal(['New order', 'Close', 'Cancel order']));
    it('should have nowhere to go when it is first', () => { const first = designModeFor(document, 'toolbar', 'b1')!; first.source.act('moveEarlier', first.selected!).should.deep.equal({ rejected: 'noWhere' }); });
});

describe('when a button is duplicated', () => {
    const document = toolbarScreen();
    const subject = designModeFor(document, 'toolbar', 'b1')!;
    const { session, plan } = carryOut(document, subject.source.act('duplicate', subject.selected!));
    it('should put a copy right after it, with an identity of its own', () => { labelsOf(session.document).should.deep.equal(['New order', 'New order', 'Cancel order', 'Close']); plan.select!.itemId!.should.not.equal('b1'); });
    it('should carry the slice and emphasis over', () => { const copy = designModeFor(session.document, 'toolbar', plan.select!.itemId!)!.selected!; copy.values.slice!.should.equal('sales.orders.PlaceOrder'); copy.values.emphasis!.should.equal('primary'); });
});

describe('when a button is deleted', () => {
    const document = toolbarScreen();
    const subject = designModeFor(document, 'toolbar', 'b2')!;
    const { session, plan } = carryOut(document, subject.source.act('delete', subject.selected!));
    it('should remove it', () => labelsOf(session.document).should.deep.equal(['New order', 'Close']));
    it('should select the one after it', () => plan.select!.itemId!.should.equal('b3'));
    it('should select no button when the last button goes', () => {
        const first = carryOut(document, designModeFor(document, 'toolbar', 'b1')!.source.act('delete', designModeFor(document, 'toolbar', 'b1')!.selected!)).session.document;
        const alone = carryOut(first, designModeFor(first, 'toolbar', 'b2')!.source.act('delete', designModeFor(first, 'toolbar', 'b2')!.selected!));
        const lone = designModeFor(alone.session.document, 'toolbar', 'b3')!;
        (carryOut(alone.session.document, lone.source.act('delete', lone.selected!)).plan.select!.itemId === null).should.be.true;
    });
});

describe('when a button is renamed', () => {
    const document = toolbarScreen();
    const subject = designModeFor(document, 'toolbar', 'b2')!;
    it('should change only its title, as one undo step', () => {
        const { session } = carryOut(document, subject.source.rename(subject.selected!, 'Abort'));
        labelsOf(session.document).should.deep.equal(['New order', 'Abort', 'Close']);
        session.undoable.should.have.length(1);
    });
});

describe('when the slice of a button is chosen', () => {
    const document = toolbarScreen();
    const subject = designModeFor(document, 'toolbar', 'b2')!;
    const choice = subject.source.choice('slice', subject.selected!)!;
    it('should offer the property the Properties tab draws, with its editor kind', () => { choice.property.descriptor.path.should.equal('slice'); choice.property.descriptor.editorKind!.should.equal('slice'); });
    it('should write the choice as an ordinary property edit', () => {
        const { session } = carryOut(document, choice.plan('sales.orders.CancelOrder'));
        designModeFor(session.document, 'toolbar', 'b2')!.selected!.values.slice!.should.equal('sales.orders.CancelOrder');
        designModeFor(session.document, 'toolbar', 'b2')!.selected!.unlinked.should.be.false;
    });
});
