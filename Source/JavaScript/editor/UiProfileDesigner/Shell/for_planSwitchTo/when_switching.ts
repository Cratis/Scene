// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellSlotAction } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { planSwitchTo } from '../shellSwitch';
import { contextWith, defaultBlueprint, screenPlacing, settings } from '../given/aShellContext';

const fullPage = { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'FullPage' };

describe('when switching the shell to a layout of the blueprint', () => {
    const outcome = planSwitchTo(settings, fullPage, contextWith());

    it('should name the shell in place and the one it would become', () => {
        outcome.plan.from.should.equal('AppShell');
        outcome.plan.to.should.equal('FullPage');
    });

    it('should be possible when no screen is in the way', () => outcome.plan.canSwitch.should.be.true);
    it('should make the layout the root template', () => outcome.settings.root!.template.id.should.equal('FullPage'));
    it('should pin the root template to the blueprint version in place', () => outcome.settings.root!.template.version!.should.match(/^\^\d+\.\d+/));
    it('should keep the blueprint as the shell', () => outcome.settings.shell.should.equal(defaultBlueprint));
    it('should leave the profile it was given as it was', () => (settings.root === undefined).should.be.true);
});

describe('when switching to the shell that is in place', () => {
    const outcome = planSwitchTo(settings, { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'AppShell' }, contextWith());

    it('should be a no-op', () => outcome.plan.isNoOp.should.be.true);
});

describe('when a screen places content in a slot the new shell lacks', () => {
    const screens = [screenPlacing('Orders', 'sidebar'), screenPlacing('Customers', 'sidebar')];
    const undecided = planSwitchTo(settings, fullPage, contextWith(screens));
    const unresolved = undecided.plan.moves.find(move => move.action === ShellSlotAction.Unresolved);
    const decided = planSwitchTo(settings, fullPage, contextWith(screens), { sidebar: { action: ShellSlotAction.MoveToPrimary } });

    it('should not allow the switch until the author decides', () => undecided.plan.canSwitch.should.be.false);
    it('should ask about that slot', () => unresolved!.slot.should.equal('sidebar'));
    it('should name the screens, not their identifiers', () => unresolved!.description.should.contain("'Orders' and 'Customers'"));
    it('should offer to move it into the primary slot, to map it or to drop it', () => unresolved!.choices!.map(choice => choice.action).should.include.members([ShellSlotAction.MoveToPrimary, ShellSlotAction.Drop]));
    it('should allow the switch once the content is moved into the primary slot', () => decided.plan.canSwitch.should.be.true);
    it('should say where the content goes', () => decided.plan.moves.find(move => move.slot === 'sidebar')!.target!.should.equal('content'));
});
