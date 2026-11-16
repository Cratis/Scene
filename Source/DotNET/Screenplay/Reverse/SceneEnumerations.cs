// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The names the Scene 4.12 editor writes for each enumeration, in the order the .NET contracts number them.
/// </summary>
static class SceneEnumerations
{
    public static readonly string[] BindingKinds = ["dataContext", "queryResult", "componentProperty", "literal"];
    public static readonly string[] BindingModes = ["oneWay", "twoWay"];
    public static readonly string[] NullBehaviors = ["propagate", "clear", "preserve"];
    public static readonly string[] GenerationModes = ["auto", "manual"];
    public static readonly string[] WidthUnits = ["fraction", "pixels", "percent", "auto"];
    public static readonly string[] TriggerKinds = ["Click", "DoubleClick", "Select", "Submit", "Change", "Load", "Unload", "Enter", "Leave"];
    public static readonly string[] NotificationLevels = ["Info", "Warning", "Error"];
    public static readonly string[] ActionKinds =
        ["ExecuteCommand", "Navigate", "NavigateBack", "OpenDialog", "CloseDialog", "RefreshQuery", "SetState", "Notify", "Confirm", "RaiseTrigger"];

    public static readonly string[] Visibilities = ["Visible", "Hidden", "Collapsed"];
    public static readonly string[] HorizontalAlignments = ["Stretch", "Left", "Center", "Right"];
    public static readonly string[] VerticalAlignments = ["Stretch", "Top", "Center", "Bottom"];

    /// <summary>
    /// The members whose values are enumerations, keyed by member name, so a document can be compared regardless of which
    /// serialization wrote it.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, string[]> ByMember = new Dictionary<string, string[]>(StringComparer.Ordinal)
    {
        ["mode"] = BindingModes,
        ["nullBehavior"] = NullBehaviors,
        ["generationMode"] = GenerationModes,
        ["unit"] = WidthUnits,
        ["level"] = NotificationLevels,
        ["visibility"] = Visibilities,
        ["horizontalAlignment"] = HorizontalAlignments,
        ["verticalAlignment"] = VerticalAlignments
    };
}
