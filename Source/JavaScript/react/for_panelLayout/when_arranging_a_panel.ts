// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColumnDefinition, Dock, DockPanel, Grid, GridUnitType, HorizontalAlignment, Orientation, RowDefinition, SceneElement, StackPanel, VerticalAlignment, Visibility, WrapPanel } from '@cratis/scene.model';
import { childStyle, panelStyle } from '../renderer/panelLayout';

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
    children: [] as SceneElement[],
};

const child = (properties: Record<string, unknown> = {}): SceneElement => ({ id: 'child', properties });

const star = (value: number): RowDefinition['height'] => ({ value, unitType: GridUnitType.Star });
const row = (over: Partial<RowDefinition> = {}): RowDefinition => ({ height: star(1), minimumHeight: 0, maximumHeight: Number.POSITIVE_INFINITY, ...over });
const column = (over: Partial<ColumnDefinition> = {}): ColumnDefinition => ({ width: star(1), minimumWidth: 0, maximumWidth: Number.POSITIVE_INFINITY, ...over });

describe('when arranging a panel', () => {
    it('should lay a stack panel out along its orientation', () => {
        const panel: StackPanel = { ...base, orientation: Orientation.Horizontal, spacing: 8 };
        panelStyle(panel)!.flexDirection!.should.equal('row');
    });

    it('should space a stack panel by its spacing', () => {
        const panel: StackPanel = { ...base, orientation: Orientation.Vertical, spacing: 12 };
        panelStyle(panel)!.gap!.should.equal('12px');
    });

    it('should wrap a wrap panel', () => {
        const panel: WrapPanel = { ...base, orientation: Orientation.Horizontal };
        panelStyle(panel)!.flexWrap!.should.equal('wrap');
    });

    it('should turn star tracks into fractions', () => {
        const panel: Grid = { ...base, rows: [row(), row({ height: star(2) })], columns: [] };
        panelStyle(panel)!.gridTemplateRows!.should.equal('1fr 2fr');
    });

    it('should turn an absolute track into pixels', () => {
        const panel: Grid = { ...base, rows: [], columns: [column({ width: { value: 240, unitType: GridUnitType.Absolute } })] };
        panelStyle(panel)!.gridTemplateColumns!.should.equal('240px');
    });

    it('should turn a content-sized track into auto', () => {
        const panel: Grid = { ...base, rows: [], columns: [column({ width: { value: 0, unitType: GridUnitType.Auto } })] };
        panelStyle(panel)!.gridTemplateColumns!.should.equal('auto');
    });

    it('should bound a track that states a minimum', () => {
        const panel: Grid = { ...base, rows: [row({ minimumHeight: 40 })], columns: [] };
        panelStyle(panel)!.gridTemplateRows!.should.equal('minmax(40px, 1fr)');
    });

    it('should leave a plain panel unstyled', () => (panelStyle({ ...base }) === undefined).should.be.true);
});

describe('when placing a child in a panel', () => {
    it('should place a grid child in the cell it names, one-based for CSS', () => {
        const panel: Grid = { ...base, rows: [row()], columns: [column()] };
        childStyle(panel, child({ 'Grid.Row': 1, 'Grid.Column': 2 }), 0)!.gridRow!.should.equal('2 / span 1');
    });

    it('should span a grid child that asks for it', () => {
        const panel: Grid = { ...base, rows: [row()], columns: [column()] };
        childStyle(panel, child({ 'Grid.Column': 0, 'Grid.ColumnSpan': 3 }), 0)!.gridColumn!.should.equal('1 / span 3');
    });

    it('should leave a grid child that names no cell to the implicit flow', () => {
        const panel: Grid = { ...base, rows: [row()], columns: [column()] };
        (childStyle(panel, child(), 0) === undefined).should.be.true;
    });

    it('should let a dock panel last child fill what is left', () => {
        const kid = child();
        const panel: DockPanel = { ...base, lastChildFill: true, children: [kid] };
        childStyle(panel, kid, 0)!.flex!.should.equal('1 1 auto');
    });

    it('should keep a docked child at its natural size', () => {
        const first = child({ Dock: Dock.Top });
        const panel: DockPanel = { ...base, lastChildFill: true, children: [first, child()] };
        childStyle(panel, first, 0)!.flex!.should.equal('0 0 auto');
    });

    it('should not let the last child fill when the panel says not to', () => {
        const kid = child();
        const panel: DockPanel = { ...base, lastChildFill: false, children: [kid] };
        childStyle(panel, kid, 0)!.flex!.should.equal('0 0 auto');
    });

    it('should size wrap panel children when the panel sizes them', () => {
        const panel: WrapPanel = { ...base, orientation: Orientation.Horizontal, itemWidth: 120 };
        childStyle(panel, child(), 0)!.width!.should.equal(120);
    });

    it('should leave wrap panel children their own size when the panel sizes neither axis', () => {
        const panel: WrapPanel = { ...base, orientation: Orientation.Horizontal };
        (childStyle(panel, child(), 0) === undefined).should.be.true;
    });
});
