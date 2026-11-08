// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Recognizes and upgrades the <c language="csharp">core:toolbar</c> element - whose <c language="csharp">items</c> slot held
/// <c language="csharp">core:toolbarItem</c> elements - that Scene 5 replaced with the <c language="csharp">core:outletItems</c>
/// element drawing an outlet of actions, for <see cref="SlotShapeUpgrader"/> and <see cref="SlotShapeValidator"/>. The
/// TypeScript twin is <c language="csharp">upgradeToolbarElement</c>.
/// </summary>
static class LegacyToolbarElement
{
    /// <summary>
    /// The component a screen's toolbar was.
    /// </summary>
    public const string ToolbarComponentName = "core:toolbar";

    /// <summary>
    /// The component each item of a legacy toolbar was.
    /// </summary>
    public const string ToolbarItemComponentName = "core:toolbarItem";

    /// <summary>
    /// The component that draws the items of an outlet where a template or screen places it.
    /// </summary>
    public const string OutletItemsComponentName = "core:outletItems";

    /// <summary>
    /// What the validator tells a document that still has a legacy toolbar element.
    /// </summary>
    public const string MigrationHint = "Scene 5 replaced the core:toolbar component and its core:toolbarItem items with an outlet of actions drawn by core:outletItems: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source";

    const string DefaultToolbarOutlet = "toolbar";

    static readonly HashSet<string> _emphases = ["primary", "secondary", "quiet"];

    /// <summary>
    /// What an old toolbar item's presentation mode becomes on the outlet button: icon and text become its display, and both
    /// is what a button shows anyway, so it becomes nothing.
    /// </summary>
    static readonly Dictionary<string, string?> _displays = new()
    {
        ["both"] = null,
        ["icon"] = "icon",
        ["text"] = "title",
    };
    static readonly string[] _destinationKeys = ["screen", "module", "route", "dialog", "slot"];

    /// <summary>
    /// Tells whether an object is a legacy toolbar element or one of its items.
    /// </summary>
    /// <param name="value">The object.</param>
    /// <returns>Whether its component is <c language="csharp">core:toolbar</c> or <c language="csharp">core:toolbarItem</c>.</returns>
    public static bool IsLegacy(JsonObject value)
    {
        var name = LegacyOutletShape.Text(value["componentName"]);
        return string.Equals(name, ToolbarComponentName, StringComparison.Ordinal) || string.Equals(name, ToolbarItemComponentName, StringComparison.Ordinal);
    }

    /// <summary>
    /// Turns a <c language="csharp">core:toolbar</c> element into the <c language="csharp">core:outletItems</c> element that draws an
    /// outlet of actions: the toolbar's <c language="csharp">name</c> names the outlet (<c language="csharp">toolbar</c> when it names
    /// none), and each item becomes a button. What the item shows (a presentation mode of <c language="json">icon</c>,
    /// <c language="json">text</c> or <c language="json">both</c>) becomes the button's <c language="json">display</c>; other
    /// presentation hints, such as a placement, have no place on a button: they are dropped and reported
    /// (<see cref="SlotShapeDiagnosticCode.DroppedPresentationHints"/>), and the item is upgraded. A toolbar
    /// holding something that cannot become a button - another element, parameters passed to a command - is reported and kept.
    /// </summary>
    /// <param name="owner">The object, which is changed in place.</param>
    /// <param name="path">The JSON path of the object.</param>
    /// <param name="diagnostics">Where what cannot be mapped is reported.</param>
    /// <returns>Whether the object changed.</returns>
    public static bool Upgrade(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (LegacyOutletShape.Text(owner["componentName"]) != ToolbarComponentName)
        {
            return false;
        }

        var properties = owner["properties"] as JsonObject ?? [];
        var elements = (owner["slots"] as JsonObject)?["items"] as JsonArray ?? [];
        var buttons = new JsonArray();
        var dropped = new List<SlotShapeDiagnostic>();
        for (var index = 0; index < elements.Count; index++)
        {
            var (button, reason, hints) = AsButton(elements[index]);
            if (button is null)
            {
                diagnostics.Add(new(
                    SlotShapeDiagnosticCode.LegacyToolbarElement,
                    $"{path}.slots.items",
                    $"The toolbar '{LegacyOutletShape.Describe(owner["id"])}' {reason}, so it is kept as it is"));
                return false;
            }

            buttons.Add(button);
            if (hints.Count > 0)
            {
                dropped.Add(new(
                    SlotShapeDiagnosticCode.DroppedPresentationHints,
                    $"{path}.slots.items[{index}].properties.presentation",
                    $"The toolbar '{LegacyOutletShape.Describe(owner["id"])}' has the item '{LegacyOutletShape.Describe(button["id"])}' with the presentation hints {string.Join(", ", hints)}, which an outlet button has no place for, so they are dropped"));
            }
        }

        diagnostics.AddRange(dropped);

        owner["componentName"] = OutletItemsComponentName;
        owner["properties"] = new JsonObject
        {
            ["name"] = NonEmpty(properties["name"]) ?? DefaultToolbarOutlet,
            ["kind"] = "actions",
            ["items"] = buttons,
        };
        owner["slots"] = new JsonObject();
        return true;
    }

    static string? NonEmpty(JsonNode? value) => LegacyOutletShape.Text(value) is { Length: > 0 } text ? text : null;

    static bool IsDestination(JsonNode? value) =>
        value is JsonObject destination && _destinationKeys.Any(key => LegacyOutletShape.Text(destination[key]) is not null);

    static bool IsBinding(JsonNode? value) => value is JsonObject binding && LegacyOutletShape.Text(binding["path"]) is not null;

    static JsonObject RouteParameterBindings(JsonObject parameters)
    {
        var bindings = new JsonObject();
        foreach (var (name, value) in parameters)
        {
            bindings[name] = IsBinding(value)
                ? value!.DeepClone()
                : new JsonObject { ["kind"] = "literal", ["path"] = string.Empty, ["value"] = value?.DeepClone() };
        }

        return bindings;
    }

    static (JsonObject? Button, string Reason, IReadOnlyList<string> Dropped) AsButton(JsonNode? element)
    {
        if (element is not JsonObject item
            || LegacyOutletShape.Text(item["componentName"]) != ToolbarItemComponentName
            || item["properties"] is not JsonObject properties)
        {
            var name = element is JsonObject other ? LegacyOutletShape.Describe(other["componentName"]) : LegacyOutletShape.Describe(element);
            return (null, $"holds '{name}', which is not a {ToolbarItemComponentName}", []);
        }

        var id = LegacyOutletShape.Describe(item["id"]);
        var presentation = properties["presentation"] as JsonObject ?? [];
        var mode = LegacyOutletShape.Text(presentation["mode"])?.ToLowerInvariant();
        var mapsMode = mode is not null && _displays.ContainsKey(mode);
        var hints = presentation
            .Where(hint => !(hint.Key == "mode" && mapsMode))
            .Select(hint => hint.Key)
            .ToList();
        var kind = NonEmpty(properties["kind"])?.ToLowerInvariant();
        var target = NonEmpty(properties["target"]);
        var slice = NonEmpty(properties["slice"]);
        var parameters = properties["parameters"] as JsonObject ?? [];
        var hasParameters = parameters.Count > 0;

        var button = new JsonObject
        {
            ["kind"] = "button",
            ["id"] = id,
            ["title"] = NonEmpty(properties["label"]) ?? NonEmpty(properties["name"]) ?? id,
        };
        if (NonEmpty(properties["icon"]) is { } icon)
        {
            button["icon"] = icon;
        }

        if (slice is not null)
        {
            button["slice"] = slice;
        }
        else if (IsDestination(properties["destination"]))
        {
            button["navigateTo"] = properties["destination"]!.DeepClone();
        }
        else if (kind == "navigate" && target is not null)
        {
            var destination = new JsonObject { ["screen"] = target };
            if (hasParameters)
            {
                destination["routeParameterBindings"] = RouteParameterBindings(parameters);
            }

            button["navigateTo"] = destination;
        }
        else if (kind == "dialog" && target is not null)
        {
            var destination = new JsonObject { ["kind"] = "dialog", ["dialog"] = target };
            if (hasParameters)
            {
                destination["routeParameterBindings"] = RouteParameterBindings(parameters);
            }

            button["navigateTo"] = destination;
        }
        else if (target is not null)
        {
            button["command"] = target;
        }

        if (hasParameters && button["navigateTo"] is null)
        {
            return (null, $"has the item '{id}' that passes parameters to its command, which an outlet button takes from the slice's inputs instead", []);
        }

        if (NonEmpty(properties["emphasis"])?.ToLowerInvariant() is { } emphasis && _emphases.Contains(emphasis))
        {
            button["emphasis"] = emphasis;
        }

        if (NonEmpty(properties["confirm"]) is { } confirm)
        {
            button["confirm"] = confirm;
        }

        if (mapsMode && _displays[mode!] is { } display)
        {
            button["display"] = display;
        }

        return (button, string.Empty, hints);
    }
}
