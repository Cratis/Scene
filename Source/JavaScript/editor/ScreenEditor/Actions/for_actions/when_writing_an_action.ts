// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, SceneEditKind } from '@cratis/scene.model';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { corePackage } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, screenName } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { applyAllToSession, applyToSession, openSession, undo } from '../../Session/EditSession';
import { actionEdits, readActionModel, toActionProperties } from '../actionBehavior';
import type { ActionModel } from '../ActionModel';
import { Opens, OutletSubject } from '@cratis/scene.model';

const model = (opens = Opens.None, opensIn?: string): ActionModel => ({
    sliceId: 'slice-checkout', sliceName: 'Check out tool', inputs: { toolId: 'row.id', note: '' }, opens, ...(opensIn ? { opensIn } : {}),
});

const runtime = createScreenEditorRuntime([corePackage], { name: 't', packages: [] } as never);
const context: EditingContext = { catalog: runtime.catalog, scope: { kind: EditingScopeKind.Screen, name: screenName } };
const withAction = () => createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('act', 'Check out', 'action', { label: 'Check out' })]));
const propertiesOf = (document: ReturnType<typeof withAction>) =>
    ((document.screens[0].slotContent.content[0] as unknown as { children: { properties: Record<string, unknown> }[] }).children[0]).properties;

describe('when writing an action', () => {
    const properties = toActionProperties(model());

    it('should address the command by the slice id, not its name', () => (properties.command as string).should.equal('slice-checkout'));
    it('should map an input that is fed', () => (properties.arguments as object[]).should.deep.equal([{ id: 'toolId', name: 'toolId', source: 'row.id' }]));
    it('should leave out an input nothing feeds', () => (properties.arguments as { name: string }[]).some(entry => entry.name === 'note').should.be.false);
    it('should record where its slice opens', () => (properties.opens as string).should.equal('none'));
});

describe('when reading an action back', () => {
    it('should round trip the inputs', () => readActionModel(toActionProperties(model()))!.inputs.should.deep.equal({ toolId: 'row.id' }));
    it('should round trip a drawer', () => readActionModel(toActionProperties(model(Opens.Drawer)))!.opens.should.equal(Opens.Drawer));
    it('should round trip a dialog', () => readActionModel(toActionProperties(model(Opens.Dialog)))!.opens.should.equal(Opens.Dialog));
    it('should round trip the slot it opens in', () => readActionModel(toActionProperties(model(Opens.Slot, 'details')))!.opensIn!.should.equal('details'));
    it('should read nothing from a component with no command', () => (readActionModel({ label: 'x' }) === undefined).should.be.true);
    it('should treat an unknown opening as automatic', () => readActionModel({ command: 'c', opens: 'popup' })!.opens.should.equal(Opens.Automatic));
});

describe('when an action is applied to a component through Scene', () => {
    const session = applyAllToSession(openSession(withAction()), actionEdits('act', model(Opens.Drawer)), context, 'Change action');

    it('should be accepted as one step', () => session.undoable.length.should.equal(1));
    it('should store the command on the component', () => (propertiesOf(session.document).command as string).should.equal('slice-checkout'));
    it('should read back what was written', () => readActionModel(propertiesOf(session.document))!.opens.should.equal(Opens.Drawer));
    it('should be seen by inspection as the command Scene describes', () =>
        inspect(session.document, elementNodeId('act'), context)!.properties.find(property => property.descriptor.path === 'command')!.effectiveValue!.should.equal('slice-checkout'));
});

describe('when an action is changed to another slice', () => {
    const applied = applyAllToSession(openSession(withAction()), actionEdits('act', model()), context, 'Change action');
    const changed = applyAllToSession(applied, actionEdits('act', { ...model(), sliceId: 'slice-return', inputs: { toolId: 'selection.id' } }), context, 'Change action');

    it('should replace the command', () => readActionModel(propertiesOf(changed.document))!.sliceId.should.equal('slice-return'));
    it('should replace the mapping with it', () => readActionModel(propertiesOf(changed.document))!.inputs.should.deep.equal({ toolId: 'selection.id' }));
    it('should be undoable back to the first slice', () => readActionModel(propertiesOf(undo(changed).document))!.sliceId.should.equal('slice-checkout'));
});

describe('when Scene is asked to blank the command', () => {
    const applied = applyAllToSession(openSession(withAction()), actionEdits('act', model()), context, 'Change action');
    const blanked = applyToSession(applied, { kind: SceneEditKind.ResetProperty, nodeId: elementNodeId('act'), path: 'command' }, context, 'Change action');

    it('should refuse, because an action without a command is not an action', () => (blanked.document === applied.document && blanked.diagnostics.length > 0).should.be.true);
});

describe('when an action carries what it acts on and when it is enabled', () => {
    const detailed: ActionModel = { ...model(Opens.Drawer), subject: OutletSubject.Item, enabledWhen: 'item.stock > 0' };
    const applied = applyAllToSession(openSession(withAction()), actionEdits('act', detailed), context, 'Change action');
    const cleared = applyAllToSession(applied, actionEdits('act', model(Opens.Drawer), propertiesOf(applied.document)), context, 'Change action');

    it('should write the condition', () => (toActionProperties(detailed).enabledWhen as string).should.equal('item.stock > 0'));
    it('should read the condition back', () => readActionModel(propertiesOf(applied.document))!.enabledWhen!.should.equal('item.stock > 0'));
    it('should read what it acts on back', () => readActionModel(propertiesOf(applied.document))!.subject!.should.equal(OutletSubject.Item));
    it('should write neither when it says nothing', () => ('enabledWhen' in toActionProperties(model())).should.be.false);
    it('should be accepted by Scene as one step', () => applied.undoable.length.should.equal(1));
    it('should leave nothing behind when the condition is taken away', () => (readActionModel(propertiesOf(cleared.document))!.enabledWhen === undefined).should.be.true);
});
