// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { designModeFor, toolbarScreen } from './given_a_screen_with_a_toolbar';

describe('when nothing is selected', () => {
    it('should have no design mode, so no chrome is drawn (DM1)', () => (designModeFor(toolbarScreen(), undefined) === undefined).should.be.true);
});

describe('when something that is not a design-mode component is selected', () => {
    it('should have no design mode', () => (designModeFor(toolbarScreen(), 'screen-root') === undefined).should.be.true);
});

describe('when the toolbar is selected', () => {
    const subject = designModeFor(toolbarScreen(), 'toolbar')!;
    it('should be the toolbar with its descriptor design mode', () => { subject.componentId.should.equal('toolbar'); subject.mode.addActions[0].id.should.equal('addButton'); });
    it('should list the buttons in order', () => subject.source.items.map(item => item.id).should.deep.equal(['b1', 'b2', 'b3']));
    it('should have no item selected', () => (subject.selected === undefined).should.be.true);
});

describe('when a button is selected', () => {
    const subject = designModeFor(toolbarScreen(), 'toolbar', 'b2')!;
    it('should be the toolbar that holds it', () => subject.componentId.should.equal('toolbar'));
    it('should select that button', () => subject.selected!.id.should.equal('b2'));
    it('should know its place among the buttons', () => { subject.selected!.index.should.equal(1); subject.selected!.count.should.equal(3); });
    it('should flag a button that links no slice', () => subject.selected!.unlinked.should.be.true);
    it('should not flag a button that links one', () => designModeFor(toolbarScreen(), 'toolbar', 'b1')!.selected!.unlinked.should.be.false);
});
