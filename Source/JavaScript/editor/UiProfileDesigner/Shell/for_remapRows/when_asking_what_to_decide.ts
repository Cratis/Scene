// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellSlotAction } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { remapChoicesOf, remapFromKey, remapKey, remapRowsOf } from '../remapRows';
import { planSwitchTo } from '../shellSwitch';
import { contextWith, defaultBlueprint, screenPlacing, settings } from '../given/aShellContext';

const fullPage = { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'FullPage' };

describe('when no screen places content where the new shell has no slot', () => {
    it('should ask nothing', () => remapRowsOf(planSwitchTo(settings, fullPage, contextWith([screenPlacing('Orders', 'content')])).plan, {}).should.be.empty);
});

describe('when screens place content where the new shell has no slot', () => {
    const screens = [screenPlacing('Orders', 'sidebar'), screenPlacing('Customers', 'sidebar'), screenPlacing('Tickets', 'content')];
    const asked = planSwitchTo(settings, fullPage, contextWith(screens));
    const rows = remapRowsOf(asked.plan, {});
    const decided = planSwitchTo(settings, fullPage, contextWith(screens), { sidebar: { action: ShellSlotAction.Drop } });

    it('should ask about that slot only', () => rows.map(row => row.slot).should.deep.equal(['sidebar']));
    it('should name the screens that use it', () => rows[0].screens.should.deep.equal(['Orders', 'Customers']));
    it('should have no choice yet', () => (rows[0].chosen === undefined).should.be.true);
    it('should keep asking, with the choice shown, once it was made', () => remapRowsOf(decided.plan, { sidebar: { action: ShellSlotAction.Drop } })[0].chosen!.action.should.equal(ShellSlotAction.Drop));
    it('should offer the primary slot, the other slots and dropping', () => {
        const choices = remapChoicesOf(asked.candidate);
        choices[0].should.deep.equal({ action: ShellSlotAction.MoveToPrimary, target: 'content' });
        choices[choices.length - 1].action.should.equal(ShellSlotAction.Drop);
    });
    it('should tell a choice from the value of a select and back', () => {
        const choices = remapChoicesOf(asked.candidate);
        choices.every(choice => remapFromKey(remapKey(choice), choices) === choice).should.be.true;
    });
});
