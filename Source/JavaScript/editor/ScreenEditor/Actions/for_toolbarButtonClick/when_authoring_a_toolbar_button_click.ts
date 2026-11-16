// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, type Behavior } from '@cratis/scene.model';
import { readToolbarButtonClick, toolbarButtonClickBehavior, withToolbarButtonClick } from '../toolbarButtonClick';
import { ToolbarButtonClickKind } from '../ToolbarButtonClickKind';

const imported: Behavior = { name: 'imported', bindings: [{ trigger: { kind: InteractionTriggerKind.Load } as never, actions: [{ kind: InteractionActionKind.RefreshQuery, query: 'Orders' } as never] }] };

describe('when a toolbar button is set to open a dialog', () => {
    const behaviors = withToolbarButtonClick([imported], { kind: ToolbarButtonClickKind.OpenDialog, target: 'OrderDialog' })!;

    it('should keep the behaviors it did not author', () => behaviors[0]!.should.equal(imported));
    it('should open the dialog template on click', () => behaviors[1]!.should.deep.equal({
        name: toolbarButtonClickBehavior,
        bindings: [{ trigger: { kind: InteractionTriggerKind.Click }, actions: [{ kind: InteractionActionKind.OpenDialog, dialogTemplate: 'OrderDialog' }] }],
    }));
    it('should read back as the same click', () => readToolbarButtonClick(behaviors).should.deep.equal({ kind: ToolbarButtonClickKind.OpenDialog, target: 'OrderDialog' }));
});

describe('when a toolbar button is changed from a dialog to a slice command', () => {
    const behaviors = withToolbarButtonClick(withToolbarButtonClick(undefined, { kind: ToolbarButtonClickKind.OpenDialog, target: 'OrderDialog' }), { kind: ToolbarButtonClickKind.ExecuteCommand, target: 'register-order' })!;

    it('should hold one click', () => behaviors.should.have.lengthOf(1));
    it('should submit the slice', () => readToolbarButtonClick(behaviors).should.deep.equal({ kind: ToolbarButtonClickKind.ExecuteCommand, target: 'register-order' }));
});

describe('when a toolbar button is set to navigate', () => {
    it('should read back the screen', () => readToolbarButtonClick(withToolbarButtonClick(undefined, { kind: ToolbarButtonClickKind.Navigate, target: 'Orders' })).should.deep.equal({ kind: ToolbarButtonClickKind.Navigate, target: 'Orders' }));
});

describe('when a toolbar button click is cleared', () => {
    it('should leave the button without behaviors', () => (withToolbarButtonClick(withToolbarButtonClick(undefined, { kind: ToolbarButtonClickKind.Navigate, target: 'Orders' }), { kind: ToolbarButtonClickKind.None, target: '' }) === undefined).should.be.true);
    it('should keep the behaviors it did not author', () => withToolbarButtonClick([imported], { kind: ToolbarButtonClickKind.None, target: '' })!.should.deep.equal([imported]));
});

describe('when a toolbar button has no click', () => {
    it('should read as doing nothing', () => readToolbarButtonClick([imported]).should.deep.equal({ kind: ToolbarButtonClickKind.None, target: '' }));
});
