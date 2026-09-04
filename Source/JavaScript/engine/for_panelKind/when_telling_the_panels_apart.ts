// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DockPanel, Grid, HorizontalAlignment, Orientation, Panel, StackPanel, VerticalAlignment, Visibility, WrapPanel } from '@cratis/scene.model';
import { isDockPanel, isGrid, isStackPanel, isWrapPanel } from '../index';

const base = {
    id: 'panel',
    properties: {},
    visibility: Visibility.Visible,
    isEnabled: true,
    opacity: 1,
    zIndex: 0,
    size: {},
    name: 'panel',
    minimumSize: {},
    maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch,
    verticalAlignment: VerticalAlignment.Stretch,
    children: [],
};

const grid: Grid = { ...base, rows: [], columns: [] };
const dock: DockPanel = { ...base, lastChildFill: true };
const stack: StackPanel = { ...base, orientation: Orientation.Vertical, spacing: 0 };
const wrap: WrapPanel = { ...base, orientation: Orientation.Horizontal };
const plain: Panel = { ...base };

describe('when telling the panels apart', () => {
    it('should recognize a grid by its tracks', () => isGrid(grid).should.be.true);
    it('should recognize a dock panel by its fill flag', () => isDockPanel(dock).should.be.true);
    it('should recognize a stack panel by its spacing', () => isStackPanel(stack).should.be.true);
    it('should recognize a wrap panel by an orientation with no spacing', () => isWrapPanel(wrap).should.be.true);

    it('should not mistake a stack panel for a wrap panel', () => isWrapPanel(stack).should.be.false);
    it('should not mistake a wrap panel for a stack panel', () => isStackPanel(wrap).should.be.false);
    it('should not mistake a grid for a dock panel', () => isDockPanel(grid).should.be.false);

    it('should leave a plain panel unclaimed by every guard', () =>
        [isGrid(plain), isDockPanel(plain), isStackPanel(plain), isWrapPanel(plain)].should.have.members([false, false, false, false]));
});
