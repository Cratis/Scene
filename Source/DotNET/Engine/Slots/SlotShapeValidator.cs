// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

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

        foreach (var (key, child) in owner)
        {
            Visit(child, $"{path}.{key}", diagnostics);
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
