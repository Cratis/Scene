// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Upgrades a stored Scene document - a whole document, a template library, or a single layout, screen template or
/// destination - from the outlet shape to the slot shape. The TypeScript twin is <c language="csharp">upgradeSlotShape</c> in
/// <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared <c language="csharp">slot-shape-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// <list type="bullet">
/// <item><description>Every <c language="csharp">outlets</c> entry of a layout or screen template becomes a slot with <c language="csharp">routed: true</c>.
/// When a slot of the same name already exists, it is marked routed and keeps its own values; the outlet's description and
/// accepted types fill in only what it lacks.</description></item>
/// <item><description><c language="csharp">metadata.primaryOutlet</c> becomes <c language="csharp">primary: true</c> on the slot it names, and leaves the metadata.</description></item>
/// <item><description>A destination's <c language="csharp">outlet</c> becomes <c language="csharp">slot</c>, and a destination kind of <c language="csharp">outlet</c> becomes <c language="csharp">slot</c>.</description></item>
/// <item><description>A nested outlet a screen declares (<c language="csharp">core:outlet</c>) becomes a nested slot (<c language="csharp">core:slot</c>).</description></item>
/// <item><description>A feature or module <c language="json">toolbar</c> (<c language="json">{ buttons }</c>), whose buttons every screen's toolbar
/// got, becomes a refinement that extends the <c language="json">toolbar</c> outlet of actions, appended to the owner's
/// <c language="json">refinements</c>. A button's <c language="json">target</c> (a command name) becomes the outlet button's <c language="json">command</c>.</description></item>
/// <item><description>A navigation model that lists regions stores outlets instead: each application region becomes an outlet of navigation (its
/// buttons the <c language="json">&lt;region&gt;Buttons</c> outlet of actions), and each module region that extends or overrides becomes a refinement of it
/// (<see cref="LegacyNavigationShape.UpgradeNavigationModel"/>).</description></item>
/// <item><description>Navigation items a screen contributes to a contribution point become contributions to the outlet of navigation of that name, in
/// the screen's <c language="json">outletContributions</c> (<see cref="LegacyNavigationShape.UpgradeNavigationContributions"/>).</description></item>
/// <item><description>An <c language="json">action</c> component's <c language="json">presentation</c> becomes <c language="json">opens</c>:
/// <c language="json">none</c> runs directly, <c language="json">modal</c> becomes <c language="json">dialog</c> and <c language="json">drawer</c> stays
/// (<see cref="LegacyActionPresentation.Upgrade"/>). An action that stores no presentation keeps opening automatically.</description></item>
/// <item><description>The upgrade is idempotent, and what cannot be mapped is reported (never thrown) and stays as it was.</description></item>
/// </list>
/// </remarks>
public static class SlotShapeUpgrader
{
    static readonly string[] _slotKeyOrder = ["name", "arrangement", "description", "role", "routed", "routedBy", "primary", "optional", "accepts"];

    /// <summary>
    /// Upgrades a stored document given as JSON text.
    /// </summary>
    /// <param name="json">The stored document.</param>
    /// <returns>The upgraded document, whether it changed, and what could not be mapped.</returns>
    public static SlotShapeUpgrade Upgrade(string json) => Upgrade(JsonNode.Parse(json));

    /// <summary>
    /// Upgrades a stored document. The document passed in is not changed.
    /// </summary>
    /// <param name="document">The stored document.</param>
    /// <returns>The upgraded document, whether it changed, and what could not be mapped.</returns>
    public static SlotShapeUpgrade Upgrade(JsonNode? document)
    {
        var diagnostics = new List<SlotShapeDiagnostic>();
        var copy = document?.DeepClone();
        var changed = Visit(copy, "$", diagnostics);
        return new(copy, changed, diagnostics);
    }

    static bool Visit(JsonNode? value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (value is JsonArray array)
        {
            var changed = false;
            for (var index = 0; index < array.Count; index++)
            {
                changed = Visit(array[index], $"{path}[{index}]", diagnostics) || changed;
            }

            return changed;
        }

        if (value is not JsonObject owner)
        {
            return false;
        }

        var ownChanged = MergeOutlets(owner);
        ownChanged = MovePrimaryOutlet(owner, path, diagnostics) || ownChanged;
        ownChanged = RenameDestination(owner, path, diagnostics) || ownChanged;
        ownChanged = UpgradeToolbar(owner) || ownChanged;
        if (LegacyNavigationShape.IsNavigationModel(owner))
        {
            LegacyNavigationShape.UpgradeNavigationModel(owner);
            ownChanged = true;
        }

        ownChanged = LegacyNavigationShape.UpgradeNavigationContributions(owner) || ownChanged;
        ownChanged = LegacyActionPresentation.Upgrade(owner, path, diagnostics) || ownChanged;
        if (LegacyOutletShape.Text(owner["componentName"]) == LegacyOutletShape.OutletComponentName)
        {
            owner["componentName"] = LegacyOutletShape.SlotComponentName;
            ownChanged = true;
        }

        foreach (var (key, child) in owner.ToList())
        {
            ownChanged = Visit(child, $"{path}.{key}", diagnostics) || ownChanged;
        }

        return ownChanged;
    }

    static bool UpgradeToolbar(JsonObject owner)
    {
        if (!LegacyOutletShape.IsToolbar(owner["toolbar"]))
        {
            return false;
        }

        var refinement = LegacyOutletShape.ToolbarAsRefinement(owner["toolbar"]!.AsObject());
        owner.Remove("toolbar");
        if (owner["refinements"] is JsonArray refinements)
        {
            refinements.Add(refinement);
        }
        else
        {
            owner["refinements"] = new JsonArray(refinement);
        }

        return true;
    }

    static bool MergeOutlets(JsonObject owner)
    {
        if (!LegacyOutletShape.IsOutletList(owner["outlets"]))
        {
            return false;
        }

        var existing = owner["slots"] as JsonArray;
        var slots = existing?.OfType<JsonObject>().Select(slot => (JsonObject)slot.DeepClone()).ToList() ?? [];
        var others = existing?.Where(slot => slot is not JsonObject).Select(slot => slot?.DeepClone()).ToList() ?? [];

        foreach (var outlet in owner["outlets"]!.AsArray().OfType<JsonObject>())
        {
            var name = LegacyOutletShape.Text(outlet["name"]);
            var index = slots.FindIndex(slot => LegacyOutletShape.Text(slot["name"]) == name);
            if (index < 0)
            {
                var slot = new JsonObject { ["name"] = name };
                CopyIfAbsent(outlet, slot, "description");
                slot["routed"] = true;
                CopyIfAbsent(outlet, slot, "accepts");
                slots.Add(Ordered(slot));
                continue;
            }

            var merged = slots[index];
            CopyIfAbsent(outlet, merged, "description");
            merged["routed"] = true;
            CopyIfAbsent(outlet, merged, "accepts");
            slots[index] = Ordered(merged);
        }

        owner["slots"] = new JsonArray([.. slots, .. others]);
        owner.Remove("outlets");
        return true;
    }

    static bool MovePrimaryOutlet(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (owner["metadata"] is not JsonObject metadata || LegacyOutletShape.Text(metadata["primaryOutlet"]) is not { } name)
        {
            return false;
        }

        var slots = (owner["slots"] as JsonArray)?.OfType<JsonObject>().ToList() ?? [];
        var target = slots.Find(slot => LegacyOutletShape.Text(slot["name"]) == name);
        var ownerName = LegacyOutletShape.Describe(owner["name"]);
        if (target is null)
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.PrimarySlotNotDeclared,
                $"{path}.metadata.primaryOutlet",
                $"The primary outlet '{name}' of '{ownerName}' is not one of its slots, so no slot can be made primary"));
            return false;
        }

        var other = slots.Find(slot => slot != target && IsTrue(slot["primary"]));
        if (other is not null)
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.MultiplePrimarySlots,
                $"{path}.metadata.primaryOutlet",
                $"The primary outlet '{name}' of '{ownerName}' conflicts with its primary slot '{LegacyOutletShape.Describe(other["name"])}'"));
            return false;
        }

        target["primary"] = true;
        Reorder(target, Ordered((JsonObject)target.DeepClone()));
        metadata.Remove("primaryOutlet");
        if (metadata.Count == 0)
        {
            owner.Remove("metadata");
        }

        return true;
    }

    static bool RenameDestination(JsonObject destination, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        var changed = false;
        if (LegacyOutletShape.IsDestinationKind(destination["kind"]))
        {
            var kind = LegacyOutletShape.Text(destination["kind"])!;
            destination["kind"] = kind == "OUTLET" ? "SLOT" : kind.StartsWith('O') ? "Slot" : "slot";
            changed = true;
        }

        if (!LegacyOutletShape.IsDestination(destination))
        {
            return changed;
        }

        var outlet = LegacyOutletShape.Text(destination["outlet"]);
        if (destination.ContainsKey("slot") && !JsonNode.DeepEquals(destination["slot"], destination["outlet"]))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.ConflictingSlotKey,
                $"{path}.outlet",
                $"The destination names the outlet '{outlet}' and the slot '{LegacyOutletShape.Describe(destination["slot"])}'; keep one"));
            return changed;
        }

        var renamed = new JsonObject();
        foreach (var (key, value) in destination.ToList())
        {
            var name = key == "outlet" ? "slot" : key;
            if (!renamed.ContainsKey(name))
            {
                renamed[name] = value?.DeepClone();
            }
        }

        Reorder(destination, renamed);
        return true;
    }

    static void CopyIfAbsent(JsonObject from, JsonObject to, string key)
    {
        if (to[key] is null && from[key] is { } value)
        {
            to[key] = value.DeepClone();
        }
    }

    static bool IsTrue(JsonNode? value) => value is JsonValue json && json.TryGetValue<bool>(out var flag) && flag;

    static JsonObject Ordered(JsonObject slot)
    {
        var result = new JsonObject();
        foreach (var key in _slotKeyOrder.Where(slot.ContainsKey))
        {
            result[key] = slot[key]?.DeepClone();
        }

        foreach (var (key, value) in slot.Where(property => !result.ContainsKey(property.Key)).ToList())
        {
            result[key] = value?.DeepClone();
        }

        return result;
    }

    static void Reorder(JsonObject target, JsonObject source)
    {
        target.Clear();
        foreach (var (key, value) in source.ToList())
        {
            source.Remove(key);
            target[key] = value;
        }
    }
}
