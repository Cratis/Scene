// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Descriptors;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// The layout types the model itself defines and what each can do - the same descriptions the TypeScript engine carries.
/// </summary>
public static class LayoutTypeDescriptors
{
    static readonly string[] _visibility = ["Visible", "Hidden", "Collapsed"];
    static readonly string[] _horizontalAlignment = ["Stretch", "Left", "Center", "Right"];
    static readonly string[] _verticalAlignment = ["Stretch", "Top", "Center", "Bottom"];
    static readonly string[] _orientation = ["Horizontal", "Vertical"];

    static readonly PropertyDescriptor[] _flowNodeProperties =
    [
        new("grow", "Grow", "Layout", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 0), Description: "How much of the free space in its container this node takes, relative to its siblings."),
        new("span", "Span", "Layout", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 1, Integer: true), Description: "How many grid columns this node spans. Only meaningful inside a grid.")
    ];

    static readonly PropertyDescriptor[] _flowContainerProperties = [Spacing("gap", "Gap", "Layout"), .. _flowNodeProperties];

    static readonly PropertyDescriptor[] _panelProperties =
    [
        new("name", "Name", "General", PropertyValueType.String),
        new("visibility", "Visibility", "General", PropertyValueType.Enum, Choices: Choices(_visibility), Default: Value("Visible")),
        new("isEnabled", "Enabled", "General", PropertyValueType.Boolean, Default: Value(true)),
        new("opacity", "Opacity", "General", PropertyValueType.Number, Default: Value(1), Constraints: new PropertyConstraints(Minimum: 0, Maximum: 1)),
        new("horizontalAlignment", "Horizontal alignment", "Layout", PropertyValueType.Enum, Choices: Choices(_horizontalAlignment)),
        new("verticalAlignment", "Vertical alignment", "Layout", PropertyValueType.Enum, Choices: Choices(_verticalAlignment)),
        new("zIndex", "Stacking order", "Layout", PropertyValueType.Number, Default: Value(0), Constraints: new PropertyConstraints(Integer: true))
    ];

    static readonly PropertyDescriptor _orientationProperty = new("orientation", "Orientation", "Layout", PropertyValueType.Enum, Choices: Choices(_orientation));

    /// <summary>
    /// Gets the description of every layout type.
    /// </summary>
    public static IReadOnlyList<LayoutTypeDescriptor> All { get; } =
    [
        new(
            LayoutType.FlowRow,
            "Row",
            new LayoutCapabilities(true, null, LayoutChildPlacement.Ordered, false, true, [LayoutType.FlowColumn, LayoutType.FlowGrid]),
            _flowContainerProperties,
            "Reflows its children horizontally."),
        new(
            LayoutType.FlowColumn,
            "Column",
            new LayoutCapabilities(true, null, LayoutChildPlacement.Ordered, false, true, [LayoutType.FlowRow, LayoutType.FlowGrid]),
            _flowContainerProperties,
            "Reflows its children vertically."),
        new(
            LayoutType.FlowGrid,
            "Grid",
            new LayoutCapabilities(true, null, LayoutChildPlacement.Ordered, true, true, [LayoutType.FlowRow, LayoutType.FlowColumn]),
            [
                .. _flowContainerProperties,
                new("columns", "Columns", "Layout", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 1, Integer: true)),
                new("rows", "Rows", "Layout", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 1, Integer: true))
            ],
            "Arranges its children in a grid; children can span columns."),
        new(
            LayoutType.FlowLeaf,
            "Content",
            new LayoutCapabilities(false, 1, LayoutChildPlacement.None, true, false, []),
            _flowNodeProperties,
            "Positions one element within a flow."),
        new(
            LayoutType.FlowSlotLeaf,
            "Slot",
            new LayoutCapabilities(false, null, LayoutChildPlacement.None, true, false, []),
            [new PropertyDescriptor("slotName", "Slot", "Layout", PropertyValueType.String, Constraints: new PropertyConstraints(Required: true)), .. _flowNodeProperties],
            "Positions one of the layout's own named slots within its arrangement."),
        new(
            LayoutType.Freeform,
            "Freeform",
            new LayoutCapabilities(true, null, LayoutChildPlacement.Positioned, false, true, []),
            [],
            "Places each child at its own position and size, one variant per size class."),
        new(
            LayoutType.StackPanel,
            "Stack panel",
            PanelCapabilities(false, [LayoutType.WrapPanel, LayoutType.DockPanel]),
            [.. _panelProperties, _orientationProperty, Spacing("spacing", "Spacing", "Layout")],
            "Stacks its children in one direction with a fixed spacing."),
        new(
            LayoutType.WrapPanel,
            "Wrap panel",
            PanelCapabilities(false, [LayoutType.StackPanel, LayoutType.DockPanel]),
            [
                .. _panelProperties,
                _orientationProperty,
                new("itemWidth", "Item width", "Layout", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 0)),
                new("itemHeight", "Item height", "Layout", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 0))
            ],
            "Lays children out along a line and wraps to the next when it is full."),
        new(
            LayoutType.DockPanel,
            "Dock panel",
            PanelCapabilities(false, [LayoutType.StackPanel, LayoutType.WrapPanel]),
            [.. _panelProperties, new PropertyDescriptor("lastChildFill", "Last child fills", "Layout", PropertyValueType.Boolean, Default: Value(true))],
            "Docks each child against an edge; the last child can fill what remains."),
        new(
            LayoutType.GridPanel,
            "Grid panel",
            PanelCapabilities(true, []),
            [
                .. _panelProperties,
                new PropertyDescriptor("rows", "Rows", "Layout", PropertyValueType.Object, EditorKind: "gridDefinitions"),
                new PropertyDescriptor("columns", "Columns", "Layout", PropertyValueType.Object, EditorKind: "gridDefinitions")
            ],
            "Positions children in rows and columns defined by the panel."),
        new(
            LayoutType.Canvas,
            "Canvas",
            new LayoutCapabilities(true, null, LayoutChildPlacement.Positioned, false, false, []),
            [.. _panelProperties, new PropertyDescriptor("extent", "Extent", "Layout", PropertyValueType.Object, EditorKind: "size")],
            "Places each child at an absolute position.")
    ];

    /// <summary>
    /// Gets what a freeform placement lets the author set.
    /// </summary>
    public static IReadOnlyList<PropertyDescriptor> PlacementProperties { get; } =
    [
        new("x", "Left", "Placement", PropertyValueType.Number),
        new("y", "Top", "Placement", PropertyValueType.Number),
        new("width", "Width", "Placement", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 0)),
        new("height", "Height", "Placement", PropertyValueType.Number, Constraints: new PropertyConstraints(Minimum: 0))
    ];

    /// <summary>
    /// Gets what a template lets the author set.
    /// </summary>
    public static IReadOnlyList<PropertyDescriptor> TemplateProperties { get; } =
    [
        new("displayName", "Display name", "General", PropertyValueType.String),
        new("description", "Description", "General", PropertyValueType.String)
    ];

    static LayoutCapabilities PanelCapabilities(bool supportsGridSpan, IReadOnlyList<LayoutType> convertibleTo) =>
        new(true, null, LayoutChildPlacement.Ordered, supportsGridSpan, false, convertibleTo);

    static PropertyDescriptor Spacing(string path, string label, string group) =>
        new(path, label, group, PropertyValueType.Number, Default: Value(0), Constraints: new PropertyConstraints(Minimum: 0));

    static PropertyChoice[] Choices(string[] values) => [.. values.Select(value => new PropertyChoice(Value(value), value))];

    static JsonElement Value<T>(T value) => JsonSerializer.SerializeToElement(value);
}
