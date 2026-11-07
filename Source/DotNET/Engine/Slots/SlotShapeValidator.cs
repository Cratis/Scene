// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
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

    static void Visit(JsonNode? value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (value is JsonArray array)
        {
            for (var index = 0; index < array.Count; index++)
            {
                Visit(array[index], $"{path}[{index}]", diagnostics);
            }

            return;
        }

        if (value is not JsonObject owner)
        {
            return;
        }

        CheckLegacy(owner, path, diagnostics);
        CheckSlots(owner, path, diagnostics);
        CheckOutlets(owner, path, diagnostics);
        CheckNavigation(owner, path, diagnostics);
        CheckPlacement(owner, path, diagnostics);

        foreach (var (key, child) in owner)
        {
            Visit(child, $"{path}.{key}", diagnostics);
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

    static void CheckLegacy(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        var name = LegacyOutletShape.Text(value["name"]) is { } text ? $"'{text}'" : "The object";
        if (LegacyOutletShape.IsOutletList(value["outlets"]))
        {
            diagnostics.Add(Legacy($"{path}.outlets", $"{name} declares outlets"));
        }

        if (value["metadata"] is JsonObject metadata && LegacyOutletShape.Text(metadata["primaryOutlet"]) is not null)
        {
            diagnostics.Add(Legacy($"{path}.metadata.primaryOutlet", $"{name} names its primary outlet in its metadata"));
        }

        if (LegacyOutletShape.IsDestinationKind(value["kind"]))
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

            if (LegacyOutletShape.Text(outlet["kind"]) is { } kind && Enum.TryParse<OutletKind>(kind, ignoreCase: true, out var parsed) && Enum.IsDefined(parsed) && !int.TryParse(kind, out _))
            {
                continue;
            }

            var described = outlet.ContainsKey("kind") ? $"the kind '{LegacyOutletShape.Describe(outlet["kind"])}'" : "no kind";
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.UnknownOutletKind,
                $"{path}.outlets[{index}].kind",
                $"The outlet '{outletName}' of '{ownerName}' has {described}; an outlet lists actions, filters, tabs, stats or navigation"));
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
}
