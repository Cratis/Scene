// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyAllToSession, openSession, undo } from '../../Session/EditSession';
import type { DesignModePlan, DesignModeRejection } from '../designModeTypes';
import { navContext, navigationDesignMode, navigationScreen } from './given_a_screen_with_a_navigation_bar';

const apply = (outcome: DesignModePlan | DesignModeRejection) => {
    if ('rejected' in outcome) throw new Error(outcome.rejected);
    return { session: applyAllToSession(openSession(navigationScreen()), outcome.edits, navContext(), outcome.label), plan: outcome };
};
const labels = (document = navigationScreen(), item?: string) => navigationDesignMode(document, 'nav', item)!.source.items.map(row => row.label);

describe('when the navigation bar is selected', () => {
    const subject = navigationDesignMode(navigationScreen(), 'nav')!;
    it('should be the navigation bar, with the design mode of its descriptor', () => { subject.componentName.should.equal('core:navigationBar'); subject.mode.itemsPath!.should.equal('items'); });
    it('should list the fixed item first and then the screen\'s own', () => labels().should.deep.equal(['Home', 'Orders', 'Customers', 'Pipeline']));
    it('should show the fixed item read-only, with the rule-named reason (DM6)', () => { const home = subject.source.items[0]; home.readOnly.should.be.true; home.readOnlyReason!.should.equal('item.inherited'); });
    it('should show the screen\'s own items editable', () => subject.source.items.slice(1).every(row => !row.readOnly).should.be.true);
    it('should count positions among the items the screen owns', () => { const own = subject.source.items.slice(1); own.map(row => row.index).should.deep.equal([0, 1, 2]); own[0].count.should.equal(3); });
    it('should flag the item that leads nowhere', () => subject.source.items[3].unlinked.should.be.true);
});

describe('when an item of the navigation bar is selected', () => {
    it('should select the row inside the component', () => navigationDesignMode(navigationScreen(), 'nav', 'customers')!.selected!.label.should.equal('Customers'));
    it('should select a read-only row too, so its reason can be shown', () => navigationDesignMode(navigationScreen(), 'nav', 'home')!.selected!.readOnly.should.be.true);
});

describe('when "+" adds an item to the navigation bar', () => {
    const { session, plan } = apply(navigationDesignMode(navigationScreen(), 'nav')!.source.add('addItem'));
    it('should add it after the screen\'s own, titled New item', () => labels(session.document).should.deep.equal(['Home', 'Orders', 'Customers', 'Pipeline', 'New item']));
    it('should select it with its title ready to be typed over', () => { plan.select!.itemId!.should.match(/^row-/); plan.renameNext!.should.be.true; });
    it('should be one undo step', () => { session.undoable.should.have.length(1); labels(undo(session).document).should.have.length(4); });
});

describe('when an item moves, duplicates, renames and is removed', () => {
    const subject = () => navigationDesignMode(navigationScreen(), 'nav', 'customers')!;
    it('should move later', () => labels(apply(subject().source.act('moveLater', subject().selected!)).session.document).should.deep.equal(['Home', 'Orders', 'Pipeline', 'Customers']));
    it('should move earlier', () => labels(apply(subject().source.act('moveEarlier', subject().selected!)).session.document).should.deep.equal(['Home', 'Customers', 'Orders', 'Pipeline']));
    it('should duplicate right after itself, carrying its destination', () => {
        const { session, plan } = apply(subject().source.act('duplicate', subject().selected!));
        labels(session.document).should.deep.equal(['Home', 'Orders', 'Customers', 'Customers', 'Pipeline']);
        navigationDesignMode(session.document, 'nav', plan.select!.itemId!)!.selected!.unlinked.should.be.false;
    });
    it('should rename', () => labels(apply(subject().source.rename(subject().selected!, 'Clients')).session.document).should.deep.equal(['Home', 'Orders', 'Clients', 'Pipeline']));
    it('should be removed, selecting the one after it', () => { const { session, plan } = apply(subject().source.act('delete', subject().selected!)); labels(session.document).should.deep.equal(['Home', 'Orders', 'Pipeline']); plan.select!.itemId!.should.equal('pipeline'); });
});

describe('when the item that is fixed by the template is acted on', () => {
    const subject = navigationDesignMode(navigationScreen(), 'nav', 'home')!;
    it('should refuse, since Scene does not let this screen change it', () => {
        const outcome = subject.source.rename(subject.selected!, 'Start');
        const applied = 'rejected' in outcome ? undefined : applyAllToSession(openSession(navigationScreen()), outcome.edits, navContext(), outcome.label);
        (applied === undefined || applied.undoable.length === 0).should.be.true;
    });
});
