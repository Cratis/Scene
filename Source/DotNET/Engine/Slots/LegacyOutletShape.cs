// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Recognizes what is left of the outlet shape Scene 5 replaced with slots, for <see cref="SlotShapeUpgrader"/> and
/// <see cref="SlotShapeValidator"/>.
/// </summary>
static class LegacyOutletShape
{
    /// <summary>
    /// The component a screen declared a nested outlet with, before Scene 5.
    /// </summary>
    public const string OutletComponentName = "core:outlet";

    /// <summary>
    /// The component a screen declares a nested routed slot with.
    /// </summary>
    public const string SlotComponentName = "core:slot";

    /// <summary>
    /// The sentence every legacy-shape diagnostic ends with: how to get out of it.
    /// </summary>
    public const string MigrationHint = "Scene 5 replaced outlets with slots: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source";

    /// <summary>
    /// What the validator tells a document that still has a feature or module toolbar.
    /// </summary>
    public const string ToolbarMigrationHint = "Scene 5 replaced feature and module toolbars with the toolbar outlet: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source";

    static readonly (string From, string To)[] _toolbarButtonKeys = [("id", "id"), ("title", "title"), ("icon", "icon"), ("slice", "slice"), ("target", "command"), ("emphasis", "emphasis")];

    static readonly HashSet<string> _outletKeys = new(StringComparer.Ordinal) { "name", "description", "accepts" };
    static readonly string[] _destinationKeys = ["screen", "module", "feature", "slice", "route", "kind", "dialog", "routeParameterBindings"];

    /// <summary>
    /// Whether a value is a list of outlets in the legacy shape: a non-empty list of <c language="csharp">{ name, description?, accepts? }</c>.
    /// Anything else - such as an outlet of items, which has a kind - is not.
    /// </summary>
    /// <param name="value">The value of an <c language="csharp">outlets</c> key.</param>
    /// <returns>Whether it is a legacy outlet list.</returns>
    public static bool IsOutletList(JsonNode? value) =>
        value is JsonArray { Count: > 0 } array
        && array.All(item => item is JsonObject outlet
            && Text(outlet["name"]) is not null
            && outlet.All(property => _outletKeys.Contains(property.Key)));

    /// <summary>
    /// Whether an object is a destination that names an outlet the legacy way: an <c language="csharp">outlet</c> text next
    /// to one of the other keys of a destination.
    /// </summary>
    /// <param name="value">The object.</param>
    /// <returns>Whether it is a legacy destination.</returns>
    public static bool IsDestination(JsonObject value) =>
        Text(value["outlet"]) is not null && _destinationKeys.Any(value.ContainsKey);

    /// <summary>
    /// Whether a destination kind is the legacy <c language="csharp">outlet</c>, in any letter case.
    /// </summary>
    /// <param name="value">The value of a <c language="csharp">kind</c> key.</param>
    /// <returns>Whether it is the legacy kind.</returns>
    public static bool IsDestinationKind(JsonNode? value) =>
        string.Equals(Text(value), "outlet", StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// The text of a JSON string value, or <see langword="null"/> for anything else.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>Its text.</returns>
    public static string? Text(JsonNode? value) =>
        value is JsonValue json && json.GetValueKind() == JsonValueKind.String ? json.GetValue<string>() : null;

    /// <summary>
    /// Tells whether a value is the toolbar of a feature or module in the shape Scene 5 replaced with the toolbar outlet: an
    /// object with nothing but a list of buttons, each with an id and a title.
    /// </summary>
    /// <param name="value">The value of an owner's <c language="json">toolbar</c> key.</param>
    /// <returns>Whether it is a legacy toolbar.</returns>
    public static bool IsToolbar(JsonNode? value) =>
        value is JsonObject { Count: 1 } toolbar
        && toolbar["buttons"] is JsonArray buttons
        && buttons.All(button => button is JsonObject candidate && Text(candidate["id"]) is not null && Text(candidate["title"]) is not null);

    /// <summary>
    /// Turns a legacy toolbar into the refinement that extends the toolbar outlet with its buttons, as stored JSON.
    /// </summary>
    /// <param name="toolbar">The legacy toolbar.</param>
    /// <returns>The refinement.</returns>
    public static JsonObject ToolbarAsRefinement(JsonObject toolbar)
    {
        var items = new JsonArray();
        foreach (var button in toolbar["buttons"]!.AsArray().OfType<JsonObject>())
        {
            var item = new JsonObject { ["kind"] = "button" };
            foreach (var (from, to) in _toolbarButtonKeys)
            {
                if (button[from] is { } value) item[to] = value.DeepClone();
            }
            items.Add(item);
        }
        return new JsonObject { ["outlet"] = Toolbar.ToolbarOutlet.Name, ["mode"] = "extends", ["items"] = items };
    }

    /// <summary>
    /// The text of a JSON value as it reads in a message: a string as is, anything else as JSON.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>Its text.</returns>
    public static string Describe(JsonNode? value) => Text(value) ?? value?.ToJsonString() ?? "null";
}
