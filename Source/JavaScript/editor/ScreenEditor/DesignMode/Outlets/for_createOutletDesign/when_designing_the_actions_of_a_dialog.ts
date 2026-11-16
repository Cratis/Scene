// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind, OutletMode, type OutletItem } from '@cratis/scene.model';
import { OutletLevelKind } from '@cratis/scene.engine';
import { refinementAt } from '../../../Outlets/outletDocument';
import { carryOut, labelsOf, screen, theScreen } from '../given/productCatalog';
import { actionsOf, orderDialogDocument } from '../given/orderDialog';

describe('when reading the actions of a dialog at the screen', () => {
    const actions = actionsOf(orderDialogDocument());

    it('should be an outlet of actions', () => actions.outletKind.should.equal(OutletKind.Actions));
    it('should say the dialog template declares it', () => actions.declaredBy!.should.equal('FormDialog'));
    it('should list Cancel and Submit', () => labelsOf(actions).should.deep.equal(['Cancel', 'Submit']));
    it('should keep both read-only, saying the dialog owns them', () => {
        actions.items.every(item => item.readOnly).should.be.true;
        actions.items.map(item => item.origin).should.deep.equal(['FormDialog', 'FormDialog']);
    });
    it('should inherit at the screen', () => actions.mode.should.equal('inherit'));
    it('should offer the screen as the level to edit at', () => actions.level.should.deep.equal(theScreen));
});

describe('when the document declares the dialog template with its own actions', () => {
    const document = orderDialogDocument({ dialogTemplates: [{ name: 'FormDialog', slots: [], outlets: [{ name: 'actions', kind: OutletKind.Actions, defaults: [{ kind: 'button', id: 'close', title: 'Close' } as OutletItem] }] }] });
    it('should draw its own button instead of Cancel and Submit', () => labelsOf(actionsOf(document)).should.deep.equal(['Close']));
});

describe('when the screen overrides the actions of the dialog and renames Cancel', () => {
    const overridden = carryOut(orderDialogDocument(), actionsOf(orderDialogDocument()).setMode('override', true));
    const afterOverride = actionsOf(overridden);
    const renamed = carryOut(overridden, afterOverride.rename(afterOverride.items.find(item => item.label === 'Cancel')!, 'Back'));
    const after = actionsOf(renamed);

    it('should copy both defaults, which are now the screen\'s own', () => {
        labelsOf(afterOverride).should.deep.equal(['Cancel', 'Submit']);
        afterOverride.items.every(item => !item.readOnly).should.be.true;
    });
    it('should show the new name', () => labelsOf(after).should.deep.equal(['Back', 'Submit']));
    it('should keep Cancel running close and Submit primary', () => {
        const items = refinementAt(renamed, theScreen, 'actions')!.items!;
        (items[0] as OutletItem & { builtIn?: string }).builtIn!.should.equal('close');
        (items[1] as OutletItem & { emphasis?: string }).emphasis!.should.equal('primary');
    });
    it('should store it as a refinement of the screen\'s level', () => {
        const level = (renamed as unknown as { outletLevels: { kind: string; name: string }[] }).outletLevels.find(candidate => candidate.kind === OutletLevelKind.Screen);
        level!.name.should.equal(screen);
        refinementAt(renamed, theScreen, 'actions')!.mode!.should.equal(OutletMode.Overrides);
    });
});

describe('when the screen hides Cancel', () => {
    const document = orderDialogDocument();
    const hidden = carryOut(document, actionsOf(document).hide(actionsOf(document).items[0]));
    const after = actionsOf(hidden);
    it('should draw only Submit', () => labelsOf(after).should.deep.equal(['Submit']));
    it('should keep Cancel listed, struck through, to bring back', () => after.removed.map(item => [item.label, item.removal]).should.deep.equal([['Cancel', 'hidden']]));
});

describe('when the screen adds a button to the actions of the dialog', () => {
    const document = orderDialogDocument();
    const added = carryOut(document, actionsOf(document).add('addButton'));
    const after = actionsOf(added);
    it('should extend the dialog\'s actions, after Cancel and Submit', () => {
        labelsOf(after).should.deep.equal(['Cancel', 'Submit', 'New button']);
        after.mode.should.equal('extend');
    });
});
