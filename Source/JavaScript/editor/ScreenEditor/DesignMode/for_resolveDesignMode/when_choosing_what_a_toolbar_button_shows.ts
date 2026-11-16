// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { redo, undo } from '../../Session/EditSession';
import { button, carryOut, designModeFor, toolbarScreen } from './given_a_screen_with_a_toolbar';

const shown = (document: Parameters<typeof designModeFor>[0], id: string) => designModeFor(document, 'toolbar', id)!.selected!.values.display;

describe('when choosing what a toolbar button shows', () => {
    const document = toolbarScreen([button('b1', 'Refresh', { icon: { library: 'Acme.Icons', key: 'refresh' } }), button('b2', 'Close')]);
    const subject = designModeFor(document, 'toolbar', 'b1')!;
    const choice = subject.source.choice('display', subject.selected!)!;

    it('should offer Scene\'s own field for it', () => choice.property.descriptor.path.should.equal('display'));
    it('should offer icon and title, icon only and title only', () => choice.property.descriptor.choices!.map(option => option.value).should.deep.equal(['iconAndTitle', 'icon', 'title']));
    it('should say a button that says nothing shows its icon and title', () => (choice.property.effectiveValue as string).should.equal('iconAndTitle'));
    it('should say nothing is written while it is the default', () => (choice.property.currentValue === undefined).should.be.true);

    describe('and icon only is chosen', () => {
        const { session } = carryOut(document, choice.plan('icon'));

        it('should write it on the button', () => shown(session.document, 'b1')!.should.equal('icon'));
        it('should leave the other button alone', () => (shown(session.document, 'b2') === undefined).should.be.true);
        it('should read it back as what the button shows', () => {
            const again = designModeFor(session.document, 'toolbar', 'b1')!;
            (again.source.choice('display', again.selected!)!.property.currentValue as string).should.equal('icon');
        });
        it('should be one undo step', () => {
            session.undoable.should.have.length(1);
            (shown(undo(session).document, 'b1') === undefined).should.be.true;
        });
        it('should come back with redo', () => shown(redo(undo(session)).document, 'b1')!.should.equal('icon'));

        describe('and then icon and title is chosen', () => {
            const again = designModeFor(session.document, 'toolbar', 'b1')!;
            const { session: back } = carryOut(session.document, again.source.choice('display', again.selected!)!.plan('iconAndTitle'));

            it('should leave the field out, as a button that says nothing shows the default', () => ('display' in designModeFor(back.document, 'toolbar', 'b1')!.selected!.values).should.be.false);
        });
    });
});

describe('when asking what a group of an outlet of actions shows', () => {
    const document = toolbarScreen([{ kind: 'group', id: 'g1', title: 'More', items: [button('b1', 'Export')] } as never]);
    const subject = designModeFor(document, 'toolbar', 'g1')!;

    it('should offer no choice, as only a button shows an icon or a title', () => (subject.source.choice('display', subject.selected!) === undefined).should.be.true);
});
