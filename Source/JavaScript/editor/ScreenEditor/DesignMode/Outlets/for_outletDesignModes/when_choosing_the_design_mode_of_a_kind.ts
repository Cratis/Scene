// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind } from '@cratis/scene.model';
import { outletDesignModeOf } from '../outletDesignModes';

const chipsOf = (kind: OutletKind) => outletDesignModeOf(kind).itemToolbar.map(action => action.id);

describe('when choosing the design mode of each kind of outlet', () => {
    it('should keep Scene\'s toolbar chips for actions, with where a button opens beside the slice', () => chipsOf(OutletKind.Actions).should.include.members(['rename', 'slice', 'opens', 'emphasis', 'moveEarlier', 'moveLater', 'duplicate', 'delete']));
    it('should keep Scene\'s navigation chips, with a sub-item', () => chipsOf(OutletKind.Navigation).should.include.members(['rename', 'target', 'addSubItem', 'delete']));
    it('should give a filter what it sets and its control', () => chipsOf(OutletKind.Filters).should.include.members(['rename', 'sets', 'control', 'moveEarlier', 'duplicate', 'delete']));
    it('should give a tab the screen it shows', () => chipsOf(OutletKind.Tabs).should.include('shows'));
    it('should give a stat where its value comes from', () => chipsOf(OutletKind.Stats).should.include('valueFrom'));
    it('should give every kind a "+" of its own', () => Object.values(OutletKind).map(kind => outletDesignModeOf(kind).addActions[0].id).should.deep.equal(['addButton', 'addFilter', 'addTab', 'addStat', 'addItem']));
});
