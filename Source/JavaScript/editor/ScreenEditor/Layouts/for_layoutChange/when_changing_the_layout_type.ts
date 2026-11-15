// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, SceneEditKind } from '@cratis/scene.model';
import { createDescriptorCatalog, elementNodeId, type EditingContext } from '@cratis/scene.engine';
import { LayoutItem } from '../LayoutItem';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, screenName } from '../../Document/studioScreen';
import { applyToSession, openSession } from '../../Session/EditSession';
import { changeLayoutType, readLayoutChange } from '../layoutChange';

const context: EditingContext = { catalog: createDescriptorCatalog([]), scope: { kind: EditingScopeKind.Screen, name: screenName } };
// A stack spaces its children; a wrap panel has no spacing, so turning one into the other drops it.
const withChildren = () => createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [
    createPanel(LayoutItem.Stack, 'stack', 'Stack', [createExternalComponent('b', 'B', 'button')]),
    createPanel(LayoutItem.Canvas, 'canvas', 'Canvas', [createExternalComponent('c', 'C', 'button', { 'Canvas.Left': 5, 'Canvas.Top': 6 })]),
]));

describe('when changing a layout type whose conversion is not offered', () => {
    const edit = changeLayoutType(elementNodeId('canvas'), 'stackPanel');
    const result = applyToSession(openSession(withChildren()), edit, context, 'Change layout');

    it('should report the refusal rather than ask', () => readLayoutChange(edit, result.undoable.length > 0, result.diagnostics).kind.should.equal('refused'));
});

describe('when changing a layout type whose conversion drops something', () => {
    const edit = changeLayoutType(elementNodeId('stack'), 'wrapPanel');
    const first = applyToSession(openSession(withChildren()), edit, context, 'Change layout');
    const step = readLayoutChange(edit, first.undoable.length > 0, first.diagnostics);

    it('should leave the screen alone until the author accepts', () => first.undoable.length.should.equal(0));
    it('should ask for confirmation, saying what would be lost', () => step.kind.should.equal('confirm'));
    it('should offer the same change with the loss accepted', () => (step.kind === 'confirm' && step.edit.acceptLoss === true && step.edit.kind === SceneEditKind.ChangeLayoutType).should.be.true);

    if (step.kind === 'confirm') {
        const second = applyToSession(openSession(withChildren()), step.edit, context, 'Change layout');
        it('should go ahead once the loss is accepted', () => second.undoable.length.should.equal(1));
        it('should be undoable', () => second.undoable.length.should.be.greaterThan(0));
    }
});

describe('when Scene is asked to change a layout that is not there', () => {
    const edit = changeLayoutType(elementNodeId('missing'), 'stackPanel');
    const result = applyToSession(openSession(withChildren()), edit, context, 'Change layout');

    it('should report the refusal rather than ask', () => readLayoutChange(edit, result.undoable.length > 0, result.diagnostics).kind.should.equal('refused'));
});
