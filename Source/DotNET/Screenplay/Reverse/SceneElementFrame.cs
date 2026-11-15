// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The members every Scene element carries for its own placement. Screenplay has no element geometry, so only the
/// values the editor gives a new element travel - implicitly - and anything else is a gap.
/// </summary>
public static class SceneElementFrame
{
    /// <summary>
    /// The component name of a panel, the element that holds other elements.
    /// </summary>
    public const string PanelComponent = "panel";
    public const string PanelChildren = "children";

    public static readonly string[] Members =
        ["visibility", "isEnabled", "opacity", "size", "zIndex", "minimumSize", "maximumSize", "margin", "horizontalAlignment", "verticalAlignment"];

    public static readonly string[] ElementMembers = ["id", "name", "properties", "behaviors", SceneNative.Member, .. Members];

    public static JsonObject Defaults() => new()
    {
        ["visibility"] = "Visible",
        ["isEnabled"] = true,
        ["opacity"] = 1,
        ["size"] = new JsonObject(),
        ["zIndex"] = 0,
        ["minimumSize"] = new JsonObject(),
        ["maximumSize"] = new JsonObject(),
        ["margin"] = new JsonObject { ["left"] = 0, ["top"] = 0, ["right"] = 0, ["bottom"] = 0 },
        ["horizontalAlignment"] = "Stretch",
        ["verticalAlignment"] = "Stretch"
    };

    public static void Check(JsonObject element, string owner, SceneTransportGaps gaps)
    {
        var defaults = Defaults();
        foreach (var member in Members.Where(member => element[member] is not null))
        {
            if (!IsDefault(member, element[member], defaults[member]))
            {
                gaps.Member(owner, member, $"Screenplay {ScreenplayVersion.Current} has no element geometry, so only the editor's default travels");
            }
        }
    }

    public static bool IsDefault(string member, JsonNode? value, JsonNode? @default) =>
        SceneDocumentCanonicalForm.Of(new JsonObject { [member] = value?.DeepClone() }) ==
        SceneDocumentCanonicalForm.Of(new JsonObject { [member] = @default?.DeepClone() });
}
