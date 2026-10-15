// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory, ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { validateComponentDescriptors } from '@cratis/scene.engine';
import { itemEditableRule, itemInheritedReason, navigationDesignMode, toolbarDesignMode } from '../designModes';

const ids = (actions: { id: string }[]) => actions.map(action => action.id);

describe('when declaring design modes', () => {
    it('should give a topbar the navigation item actions, with the target and slot of the navigation region', () =>
        ids(navigationDesignMode().itemToolbar).should.deep.equal(['rename', 'target', 'slot', 'moveEarlier', 'moveLater', 'duplicate', 'delete']));

    it('should give a sidebar the same actions, compact, plus add sub-item', () => {
        const { itemToolbar } = navigationDesignMode({ sidebar: true });
        ids(itemToolbar).should.deep.equal(['rename', 'target', 'slot', 'moveEarlier', 'moveLater', 'duplicate', 'delete', 'addSubItem']);
        itemToolbar.every(action => action.compact === true).should.be.true;
    });

    it('should leave target and slot out of a component whose items are a collection property', () => {
        const mode = navigationDesignMode({ itemsPath: 'items' });
        ids(mode.itemToolbar).should.not.include.members(['target', 'slot']);
        mode.itemsPath!.should.equal('items');
        mode.addActions[0].collectionPath!.should.equal('items');
    });

    it('should give a toolbar the button actions', () =>
        ids(toolbarDesignMode().itemToolbar).should.deep.equal(['rename', 'slice', 'emphasis', 'moveEarlier', 'moveLater', 'duplicate', 'delete']));

    it('should name rules, never carry functions, so every mutating action is hidden for an inherited item with a reason', () => {
        for (const action of [...toolbarDesignMode().itemToolbar, ...navigationDesignMode().itemToolbar]) {
            action.availability!.should.equal(itemEditableRule);
            action.readOnlyReason!.should.equal(itemInheritedReason);
            JSON.parse(JSON.stringify(action)).should.deep.equal(action);
        }
    });

    it('should describe a design mode the validation accepts', () => {
        const descriptor: ComponentDescriptor = {
            component: 'Test:navigationBar', category: ComponentCategory.Navigation, designMode: navigationDesignMode({ itemsPath: 'items' }),
            properties: [{ path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection, item: { properties: [] } }],
        };
        validateComponentDescriptors([descriptor]).should.be.empty;
    });
});
