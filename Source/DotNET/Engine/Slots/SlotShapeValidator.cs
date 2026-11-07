// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Checks that a stored Scene document is in the slot shape: nothing left of the outlet shape, every slot role known, route
/// parameters only on routed slots, and at most one primary slot per layout or screen template. Saving a document runs it
/// (<see cref="Editing.SceneDocumentChangeValidation"/>). The TypeScript twin is <c language="csharp">validateSlotShape</c>; both are
/// asserted against the shared <c language="csharp">slot-shape-fixtures.json</c> corpus.
/// </summary>
public static class SlotShapeValidator
{
    /// <summary>
    /// The sentence every legacy-shape diagnostic ends with: how to get out of it.
    /// </summary>
    public const string MigrationHint = LegacyOutletShape.MigrationHint;

    static readonly HashSet<string> _roles = new(StringComparer.OrdinalIgnoreCase) { "page", "pane", "panel" };
    static readonly HashSet<string> _opens = new(StringComparer.OrdinalIgnoreCase) { "automatic", "none", "dialog", "drawer", "slot" };
    static readonly HashSet<string> _fits = new(StringComparer.OrdinalIgnoreCase) { "dialog", "drawer", "pane", "panel", "page" };
    static readonly HashSet<string> _actionItemKinds = new(StringComparer.OrdinalIgnoreCase) { "button", "menuEntry" };
    static readonly string[] _outletItemListKeys = ["refinements", "contributions", "outletContributions"];

    /// <summary>
    /// Checks a stored document given as JSON text.
    /// </summary>
    /// <param name="json">The stored document.</param>
    /// <returns>What is wrong, in document order; empty when the document is in the slot shape.</returns>
    public static IReadOnlyList<SlotShapeDiagnostic> Validate(string json) => Validate(JsonNode.Parse(json));

    /// <summary>
    /// Checks a stored document.
    /// </summary>
    /// <param name="document">The stored document.</param>
    /// <returns>What is wrong, in document order; empty when the document is in the slot shape.</returns>
    public static IReadOnlyList<SlotShapeDiagnostic> Validate(JsonNode? document)
    {
        var diagnostics = new List<SlotShapeDiagnostic>();
        Visit(document, "$", diagnostics);
        return diagnostics;
    }

    static void Visit(JsonNode? value, string path, List<SlotShapeDiagnostic> diagnostics, bool inValues = false)
    {
        if (value is JsonArray array)
        {
            for (var index = 0; index < array.Count; index++)
            {
                Visit(array[index], $"{path}[{index}]", diagnostics, inValues);
            }

            return;
        }

        if (value is not JsonObject owner)
        {
            return;
        }

        CheckLegacy(owner, path, diagnostics, inValues);
        if (!inValues)
        {
            CheckSlots(owner, path, diagnostics);
            CheckOutlets(owner, path, diagnostics);
            CheckNavigation(owner, path, diagnostics);
        }

        if (!inValues || LegacyOutletShape.Text(owner["componentName"]) is not null)
        {
            CheckPlacement(owner, path, diagnostics);
        }

        foreach (var (key, child) in owner)
        {
            Visit(child, $"{path}.{key}", diagnostics, inValues || LegacyOutletShape.HoldsUserValues(owner, key));
        }
    }

    static void CheckNavigation(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (LegacyNavigationShape.IsNavigationModel(owner))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyNavigationShape,
                $"{path}.application.regions",
                $"The navigation lists regions. {LegacyOutletShape.NavigationMigrationHint}"));
        }

        if (owner["contributions"] is not JsonArray contributions)
        {
            return;
        }

        for (var index = 0; index < contributions.Count; index++)
        {
            if (!LegacyNavigationShape.IsNavigationContribution(contributions[index]))
            {
                continue;
            }

            var point = contributions[index]!["contributionPointName"]!.GetValue<string>();
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyNavigationContribution,
                $"{path}.contributions[{index}]",
                $"A navigation item is contributed to the contribution point '{point}'. {LegacyOutletShape.NavigationMigrationHint}"));
        }
    }

    static SlotShapeDiagnostic Legacy(string path, string what) =>
        new(SlotShapeDiagnosticCode.LegacyOutletShape, path, $"{what}. {LegacyOutletShape.MigrationHint}");

    static void CheckLegacy(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics, bool inValues)
    {
        var name = LegacyOutletShape.Text(value["name"]) is { } text ? $"'{text}'" : "The object";
        if (!inValues && LegacyOutletShape.IsOutletList(value["outlets"]))
        {
            diagnostics.Add(Legacy($"{path}.outlets", $"{name} declares outlets"));
        }

        if (!inValues && value["metadata"] is JsonObject metadata && LegacyOutletShape.Text(metadata["primaryOutlet"]) is not null)
        {
            diagnostics.Add(Legacy($"{path}.metadata.primaryOutlet", $"{name} names its primary outlet in its metadata"));
        }

        if (LegacyOutletShape.IsDestinationOfLegacyKind(value))
        {
            diagnostics.Add(Legacy($"{path}.kind", $"A destination opens the kind '{LegacyOutletShape.Text(value["kind"])}'"));
        }

        if (LegacyOutletShape.Text(value["componentName"]) == LegacyOutletShape.OutletComponentName)
        {
            diagnostics.Add(Legacy($"{path}.componentName", $"A screen declares a nested outlet with '{LegacyOutletShape.OutletComponentName}'"));
        }

        if (LegacyOutletShape.IsDestination(value))
        {
            diagnostics.Add(Legacy($"{path}.outlet", $"A destination names the outlet '{LegacyOutletShape.Text(value["outlet"])}'"));
        }

        if (LegacyToolbarElement.IsLegacy(value))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyToolbarElement,
                $"{path}.componentName",
                $"The element '{LegacyOutletShape.Describe(value["id"])}' is a {LegacyOutletShape.Text(value["componentName"])}. {LegacyToolbarElement.MigrationHint}"));
        }
    }

    static (JsonObject Action, string Path, string Name)? ActionOf(JsonObject value, string path)
    {
        if (LegacyActionPresentation.IsActionComponent(value) && value["properties"] is JsonObject properties)
        {
            return (properties, $"{path}.properties", LegacyOutletShape.Describe(value["id"]));
        }

        return LegacyOutletShape.Text(value["kind"]) is { } kind && _actionItemKinds.Contains(kind)
            ? (value, path, LegacyOutletShape.Describe(value["id"]))
            : null;
    }

    static void CheckPlacement(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (LegacyActionPresentation.IsLegacy(value))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyActionPresentation,
                $"{path}.properties.{LegacyActionPresentation.Property}",
                $"The action '{LegacyOutletShape.Describe(value["id"])}' stores a presentation. {LegacyActionPresentation.MigrationHint}"));
        }

        if (ActionOf(value, path) is var (action, actionPath, name))
        {
            var opens = action["opens"];
            var text = LegacyOutletShape.Text(opens);
            if (opens is not null && (text is null || !_opens.Contains(text)))
            {
                diagnostics.Add(new(
                    SlotShapeDiagnosticCode.UnknownOpens,
                    $"{actionPath}.opens",
                    $"The action '{name}' opens '{LegacyOutletShape.Describe(opens)}'; an action opens automatically, runs directly (none), or opens in a dialog, a drawer or a slot"));
            }

            if (string.Equals(text, "slot", StringComparison.OrdinalIgnoreCase) && string.IsNullOrEmpty(LegacyOutletShape.Text(action["opensIn"])))
            {
                diagnostics.Add(new(
                    SlotShapeDiagnosticCode.OpensSlotWithoutName,
                    $"{actionPath}.opensIn",
                    $"The action '{name}' opens in a slot but does not name one"));
            }
        }

        if (value["fits"] is not JsonArray fits)
        {
            return;
        }

        var screen = LegacyOutletShape.Text(value["name"]) ?? "(unnamed)";
        for (var index = 0; index < fits.Count; index++)
        {
            if (LegacyOutletShape.Text(fits[index]) is { } fit && _fits.Contains(fit))
            {
                continue;
            }

            diagnostics.Add(new(
                SlotShapeDiagnosticCode.UnknownScreenFit,
                $"{path}.fits[{index}]",
                $"The screen '{screen}' fits '{LegacyOutletShape.Describe(fits[index])}'; a screen fits a dialog, a drawer, a pane, a panel or a page"));
        }
    }

    static void CheckOutlets(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        var ownerName = LegacyOutletShape.Text(owner["name"]) ?? "(unnamed)";
        if (LegacyOutletShape.IsToolbar(owner["toolbar"]))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.LegacyToolbarShape,
                $"{path}.toolbar",
                $"'{ownerName}' has a toolbar whose buttons every screen gets. {LegacyOutletShape.ToolbarMigrationHint}"));
        }

        foreach (var key in _outletItemListKeys)
        {
            if (owner[key] is not JsonArray entries)
            {
                continue;
            }

            for (var index = 0; index < entries.Count; index++)
            {
                if (entries[index] is JsonObject entry && LegacyOutletShape.Text(entry["outlet"]) is { } outletName && entry["items"] is JsonArray items)
                {
                    CheckOutletItems(items, new(outletName, null, null), $"{path}.{key}[{index}].items", diagnostics);
                }
            }
        }

        if (owner["outlets"] is not JsonArray outlets || LegacyOutletShape.IsOutletList(outlets))
        {
            return;
        }

        for (var index = 0; index < outlets.Count; index++)
        {
            if (outlets[index] is not JsonObject outlet || LegacyOutletShape.Text(outlet["name"]) is not { } outletName)
            {
                continue;
            }

            if (OutletKindOf(outlet["kind"]) is { } outletKind)
            {
                if (outlet["defaults"] is JsonArray defaults)
                {
                    CheckOutletItems(defaults, new(outletName, outletKind, null), $"{path}.outlets[{index}].defaults", diagnostics);
                }

                continue;
            }

            var described = outlet.ContainsKey("kind") ? $"the kind '{LegacyOutletShape.Describe(outlet["kind"])}'" : "no kind";
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.UnknownOutletKind,
                $"{path}.outlets[{index}].kind",
                $"The outlet '{outletName}' of '{ownerName}' has {described}; an outlet lists actions, filters, tabs, stats or navigation"));
        }
    }

    static OutletKind? OutletKindOf(JsonNode? value) =>
        LegacyOutletShape.Text(value) is { } kind && Enum.TryParse<OutletKind>(kind, ignoreCase: true, out var parsed) && Enum.IsDefined(parsed) && !int.TryParse(kind, out _)
            ? parsed
            : null;

    static OutletItemKind? OutletItemKindOf(JsonNode? value) =>
        LegacyOutletShape.Text(value) is { } kind && Enum.TryParse<OutletItemKind>(kind, ignoreCase: true, out var parsed) && Enum.IsDefined(parsed) && !int.TryParse(kind, out _)
            ? parsed
            : null;

    static void CheckOutletItems(JsonArray items, OutletItemsOwner owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        for (var index = 0; index < items.Count; index++)
        {
            if (items[index] is not JsonObject item)
            {
                continue;
            }

            var itemPath = $"{path}[{index}]";
            var id = LegacyOutletShape.Text(item["id"]) is { Length: > 0 } text ? text : null;
            var named = id ?? "(no id)";
            if (OutletItemKindOf(item["kind"]) is not { } kind)
            {
                var described = item.ContainsKey("kind") ? $"the kind '{LegacyOutletShape.Describe(item["kind"])}'" : "no kind";
                diagnostics.Add(new(
                    SlotShapeDiagnosticCode.UnknownOutletItemKind,
                    $"{itemPath}.kind",
                    $"The item '{named}' of the outlet '{owner.Outlet}' has {described}; an outlet item is a button, menu entry, separator, group, filter, tab, stat or navigation item"));
                continue;
            }

            var name = OutletItemKinds.NameOf(kind);
            var allowed = owner.Group is not null ? OutletItemKinds.InGroup : owner.Kind is { } outletKind ? OutletItemKinds.AllowedIn(outletKind) : null;
            if (allowed?.Contains(kind) == false)
            {
                var message = owner.Group is not null
                    ? $"The {name} '{named}' cannot go in the group '{owner.Group}' of the outlet '{owner.Outlet}', which takes buttons, menu entries and separators"
                    : $"The {name} '{named}' cannot go in the {OutletItemKinds.NameOf(owner.Kind!.Value)} outlet '{owner.Outlet}', which takes {OutletItemKinds.Describe(owner.Kind!.Value)}";
                diagnostics.Add(new(SlotShapeDiagnosticCode.OutletItemKindMismatch, $"{itemPath}.kind", message));
                continue;
            }

            void Incomplete(string field, string what) => diagnostics.Add(new(
                SlotShapeDiagnosticCode.IncompleteOutletItem,
                $"{itemPath}.{field}",
                $"The {name} '{named}' of the outlet '{owner.Outlet}' has no {what}"));

            if (id is null)
            {
                Incomplete("id", "id");
            }

            if (kind != OutletItemKind.Separator && LegacyOutletShape.Text(item["title"]) is not { Length: > 0 })
            {
                Incomplete("title", "title");
            }

            if (kind == OutletItemKind.Tab && LegacyOutletShape.Text(item["shows"]) is not { Length: > 0 })
            {
                Incomplete("shows", "screen to show");
            }

            if (kind == OutletItemKind.Group)
            {
                if (item["items"] is JsonArray children)
                {
                    CheckOutletItems(children, owner with { Group = named }, $"{itemPath}.items", diagnostics);
                }
                else
                {
                    Incomplete("items", "items");
                }
            }
        }
    }

    static void CheckSlots(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (owner["slots"] is not JsonArray slots)
        {
            return;
        }

        var ownerName = LegacyOutletShape.Text(owner["name"]) ?? "(unnamed)";
        var primaries = new List<string>();
        for (var index = 0; index < slots.Count; index++)
        {
            if (slots[index] is not JsonObject slot || LegacyOutletShape.Text(slot["name"]) is not { } slotName)
            {
                continue;
            }

            var slotPath = $"{path}.slots[{index}]";
            if (slot.ContainsKey("role") && (LegacyOutletShape.Text(slot["role"]) is not { } role || !_roles.Contains(role)))
            {
                diagnostics.Add(new(
                    SlotShapeDiagnosticCode.UnknownSlotRole,
                    $"{slotPath}.role",
                    $"The slot '{slotName}' of '{ownerName}' has the role '{LegacyOutletShape.Describe(slot["role"])}'; a slot is a page, a pane or a panel"));
            }

            if (slot["routedBy"] is JsonArray { Count: > 0 } routedBy && !IsTrue(slot["routed"]))
            {
                diagnostics.Add(new(
                    SlotShapeDiagnosticCode.RouteParametersWithoutRouting,
                    $"{slotPath}.routedBy",
                    $"The slot '{slotName}' of '{ownerName}' is routed by {string.Join(", ", routedBy.Select(LegacyOutletShape.Describe))} but is not routed"));
            }

            if (IsTrue(slot["primary"]))
            {
                primaries.Add(slotName);
            }
        }

        if (primaries.Count > 1)
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.MultiplePrimarySlots,
                $"{path}.slots",
                $"'{ownerName}' marks {string.Join(", ", primaries.Select(primary => $"'{primary}'"))} as primary; only one slot can be"));
        }
    }

    static bool IsTrue(JsonNode? value) => value is JsonValue json && json.TryGetValue<bool>(out var flag) && flag;

    sealed record OutletItemsOwner(string Outlet, OutletKind? Kind, string? Group);
}
