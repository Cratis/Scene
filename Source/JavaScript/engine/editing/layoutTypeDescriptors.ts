// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    HorizontalAlignment, LayoutChildPlacement, LayoutType, LayoutTypeDescriptor, Orientation, PropertyChoice,
    PropertyDescriptor, PropertyValueType, VerticalAlignment, Visibility,
} from '@cratis/scene.model';

function choices(enumObject: Record<string, string>): PropertyChoice[] {
    return Object.values(enumObject).map(value => ({ value, label: value }));
}

const spacing = (path: string, label: string, group: string): PropertyDescriptor => ({
    path, label, group, valueType: PropertyValueType.Number, default: 0, constraints: { minimum: 0 },
});

const flowNodeProperties: PropertyDescriptor[] = [
    {
        path: 'grow', label: 'Grow', group: 'Layout', valueType: PropertyValueType.Number,
        description: 'How much of the free space in its container this node takes, relative to its siblings.',
        constraints: { minimum: 0 },
    },
    {
        path: 'span', label: 'Span', group: 'Layout', valueType: PropertyValueType.Number,
        description: 'How many grid columns this node spans. Only meaningful inside a grid.',
        constraints: { minimum: 1, integer: true },
    },
];

const flowContainerProperties: PropertyDescriptor[] = [spacing('gap', 'Gap', 'Layout'), ...flowNodeProperties];

const panelProperties: PropertyDescriptor[] = [
    { path: 'name', label: 'Name', group: 'General', valueType: PropertyValueType.String },
    { path: 'visibility', label: 'Visibility', group: 'General', valueType: PropertyValueType.Enum, choices: choices(Visibility), default: Visibility.Visible },
    { path: 'isEnabled', label: 'Enabled', group: 'General', valueType: PropertyValueType.Boolean, default: true },
    { path: 'opacity', label: 'Opacity', group: 'General', valueType: PropertyValueType.Number, default: 1, constraints: { minimum: 0, maximum: 1 } },
    { path: 'horizontalAlignment', label: 'Horizontal alignment', group: 'Layout', valueType: PropertyValueType.Enum, choices: choices(HorizontalAlignment) },
    { path: 'verticalAlignment', label: 'Vertical alignment', group: 'Layout', valueType: PropertyValueType.Enum, choices: choices(VerticalAlignment) },
    { path: 'zIndex', label: 'Stacking order', group: 'Layout', valueType: PropertyValueType.Number, default: 0, constraints: { integer: true } },
];

const orientation: PropertyDescriptor = {
    path: 'orientation', label: 'Orientation', group: 'Layout', valueType: PropertyValueType.Enum, choices: choices(Orientation),
};

const panelChildren = { acceptsChildren: true, childPlacement: LayoutChildPlacement.Ordered, supportsSizeClassVariants: false };

/**
 * The layout type -> capability matrix, as data. Every {@link LayoutType} has exactly one entry; the
 * documentation's matrix is this table.
 */
export const layoutTypeDescriptors: LayoutTypeDescriptor[] = [
    {
        type: LayoutType.FlowRow,
        label: 'Row',
        description: 'Reflows its children horizontally.',
        capabilities: {
            acceptsChildren: true, childPlacement: LayoutChildPlacement.Ordered, supportsGridSpan: false,
            supportsSizeClassVariants: true, convertibleTo: [LayoutType.FlowColumn, LayoutType.FlowGrid],
        },
        properties: flowContainerProperties,
    },
    {
        type: LayoutType.FlowColumn,
        label: 'Column',
        description: 'Reflows its children vertically.',
        capabilities: {
            acceptsChildren: true, childPlacement: LayoutChildPlacement.Ordered, supportsGridSpan: false,
            supportsSizeClassVariants: true, convertibleTo: [LayoutType.FlowRow, LayoutType.FlowGrid],
        },
        properties: flowContainerProperties,
    },
    {
        type: LayoutType.FlowGrid,
        label: 'Grid',
        description: 'Arranges its children in a grid; children can span columns.',
        capabilities: {
            acceptsChildren: true, childPlacement: LayoutChildPlacement.Ordered, supportsGridSpan: true,
            supportsSizeClassVariants: true, convertibleTo: [LayoutType.FlowRow, LayoutType.FlowColumn],
        },
        properties: [
            ...flowContainerProperties,
            { path: 'columns', label: 'Columns', group: 'Layout', valueType: PropertyValueType.Number, constraints: { minimum: 1, integer: true } },
            { path: 'rows', label: 'Rows', group: 'Layout', valueType: PropertyValueType.Number, constraints: { minimum: 1, integer: true } },
        ],
    },
    {
        type: LayoutType.FlowLeaf,
        label: 'Content',
        description: 'Positions one element within a flow.',
        capabilities: {
            acceptsChildren: false, maximumChildren: 1, childPlacement: LayoutChildPlacement.None, supportsGridSpan: true,
            supportsSizeClassVariants: false, convertibleTo: [],
        },
        properties: flowNodeProperties,
    },
    {
        type: LayoutType.FlowSlotLeaf,
        label: 'Slot',
        description: 'Positions one of the layout\'s own named slots within its arrangement.',
        capabilities: {
            acceptsChildren: false, childPlacement: LayoutChildPlacement.None, supportsGridSpan: true,
            supportsSizeClassVariants: false, convertibleTo: [],
        },
        properties: [
            { path: 'slotName', label: 'Slot', group: 'Layout', valueType: PropertyValueType.String, constraints: { required: true } },
            ...flowNodeProperties,
        ],
    },
    {
        type: LayoutType.Freeform,
        label: 'Freeform',
        description: 'Places each child at its own position and size, one variant per size class.',
        capabilities: {
            acceptsChildren: true, childPlacement: LayoutChildPlacement.Positioned, supportsGridSpan: false,
            supportsSizeClassVariants: true, convertibleTo: [],
        },
        properties: [],
    },
    {
        type: LayoutType.StackPanel,
        label: 'Stack panel',
        description: 'Stacks its children in one direction with a fixed spacing.',
        capabilities: { ...panelChildren, supportsGridSpan: false, convertibleTo: [LayoutType.WrapPanel, LayoutType.DockPanel] },
        properties: [...panelProperties, orientation, spacing('spacing', 'Spacing', 'Layout')],
    },
    {
        type: LayoutType.WrapPanel,
        label: 'Wrap panel',
        description: 'Lays children out along a line and wraps to the next when it is full.',
        capabilities: { ...panelChildren, supportsGridSpan: false, convertibleTo: [LayoutType.StackPanel, LayoutType.DockPanel] },
        properties: [
            ...panelProperties,
            orientation,
            { path: 'itemWidth', label: 'Item width', group: 'Layout', valueType: PropertyValueType.Number, constraints: { minimum: 0 } },
            { path: 'itemHeight', label: 'Item height', group: 'Layout', valueType: PropertyValueType.Number, constraints: { minimum: 0 } },
        ],
    },
    {
        type: LayoutType.DockPanel,
        label: 'Dock panel',
        description: 'Docks each child against an edge; the last child can fill what remains.',
        capabilities: { ...panelChildren, supportsGridSpan: false, convertibleTo: [LayoutType.StackPanel, LayoutType.WrapPanel] },
        properties: [
            ...panelProperties,
            { path: 'lastChildFill', label: 'Last child fills', group: 'Layout', valueType: PropertyValueType.Boolean, default: true },
        ],
    },
    {
        type: LayoutType.GridPanel,
        label: 'Grid panel',
        description: 'Positions children in rows and columns defined by the panel.',
        capabilities: { ...panelChildren, supportsGridSpan: true, convertibleTo: [] },
        properties: [
            ...panelProperties,
            { path: 'rows', label: 'Rows', group: 'Layout', valueType: PropertyValueType.Object, editorKind: 'gridDefinitions' },
            { path: 'columns', label: 'Columns', group: 'Layout', valueType: PropertyValueType.Object, editorKind: 'gridDefinitions' },
        ],
    },
    {
        type: LayoutType.Canvas,
        label: 'Canvas',
        description: 'Places each child at an absolute position.',
        capabilities: {
            acceptsChildren: true, childPlacement: LayoutChildPlacement.Positioned, supportsGridSpan: false,
            supportsSizeClassVariants: false, convertibleTo: [],
        },
        properties: [
            ...panelProperties,
            { path: 'extent', label: 'Extent', group: 'Layout', valueType: PropertyValueType.Object, editorKind: 'size' },
        ],
    },
];

/**
 * The editable properties of a placement within a freeform variant - an element's or a slot's position and size.
 */
export const placementProperties: PropertyDescriptor[] = [
    { path: 'x', label: 'Left', group: 'Placement', valueType: PropertyValueType.Number },
    { path: 'y', label: 'Top', group: 'Placement', valueType: PropertyValueType.Number },
    { path: 'width', label: 'Width', group: 'Placement', valueType: PropertyValueType.Number, constraints: { minimum: 0 } },
    { path: 'height', label: 'Height', group: 'Placement', valueType: PropertyValueType.Number, constraints: { minimum: 0 } },
];

/**
 * The editable properties of a screen template or dialog template itself.
 */
export const templateProperties: PropertyDescriptor[] = [
    { path: 'displayName', label: 'Display name', group: 'General', valueType: PropertyValueType.String },
    { path: 'description', label: 'Description', group: 'General', valueType: PropertyValueType.String },
];
