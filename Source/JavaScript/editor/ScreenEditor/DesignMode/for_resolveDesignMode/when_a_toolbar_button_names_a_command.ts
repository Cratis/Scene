// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.react';
import { elementNodeId, inspect } from '@cratis/scene.engine';
import { createScreenDocument, editingScope } from '../../Document/studioScreen';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { composeEditorScreen } from '../../Templates/composeEditorScreen';
import { resolveOwnership } from '../../Templates/templateProvenance';
import { application, button, toolbarOf } from '../../Toolbar/for_toolbar/given_a_toolbar_and_an_application';
import { resolveDesignMode } from '../resolveDesignMode';

const runtime = createScreenEditorRuntime([corePackage], { name: 'test', packages: [] } as never);
const document = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [toolbarOf(
    button('legacy', { kind: 'Action', target: 'PlaceOrderCommand' }), button('empty', { kind: 'Action' }), button('linked', { kind: 'Action', slice: 'sales.orders.CancelOrder' }),
)]), undefined);
const context = { catalog: runtime.catalog, scope: editingScope(undefined) };
const roots = composeEditorScreen(document, undefined).roots;
const items = (withApplication: boolean) => resolveDesignMode({
    roots, catalog: runtime.catalog, selectedId: 'toolbar', selectedItemId: undefined, ownershipOf: resolveOwnership(document, roots, context), newId: () => 'x',
    inspect: id => inspect(document, elementNodeId(id), context), startingLabels: { button: 'Button', item: 'New item' }, ...(withApplication ? { structure: application } : {}),
})!.source.items;

describe('when the toolbar knows the application', () => {
    const buttons = items(true);
    it('should show the slice a button that names a command already runs, and not flag it', () => { buttons[0].values.slice!.should.equal('sales.orders.PlaceOrder'); buttons[0].unlinked.should.be.false; });
    it('should flag a button with neither', () => buttons[1].unlinked.should.be.true);
    it('should leave a linked button alone', () => { buttons[2].values.slice!.should.equal('sales.orders.CancelOrder'); buttons[2].unlinked.should.be.false; });
});

describe('when the toolbar does not know the application', () => {
    it('should not flag a button that names a command, but it cannot say which slice it runs', () => { items(false)[0].unlinked.should.be.false; (items(false)[0].values.slice === undefined).should.be.true; });
});
