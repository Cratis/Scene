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
    static readonly HashSet<string> _buttonDisplays = new(StringComparer.OrdinalIgnoreCase) { "iconAndTitle", "icon", "title" };
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

        CheckOwner(owner, path, diagnostics, inValues);

        foreach (var (key, child) in owner)
        {
            Visit(child, $"{path}.{key}", diagnostics, inValues || LegacyOutletShape.HoldsUserValues(owner, key));
        }
    }

    static void CheckOwner(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics, bool inValues)
    {
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

    static void CheckOutletDeclarations(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
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
    }

    static void CheckLegacy(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics, bool inValues)
    {
        if (!inValues)
        {
            CheckOutletDeclarations(value, path, diagnostics);
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

    static bool IsUnknownOpens(JsonNode? opens) =>
        opens is not null && (LegacyOutletShape.Text(opens) is not { } text || !_opens.Contains(text));

    static bool OpensSlotWithoutName(JsonNode? opens, JsonObject action) =>
        string.Equals(LegacyOutletShape.Text(opens), "slot", StringComparison.OrdinalIgnoreCase)
        && string.IsNullOrEmpty(LegacyOutletShape.Text(action["opensIn"]));

    static void CheckActionPresentation(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (!LegacyActionPresentation.IsLegacy(value))
        {
            return;
        }

        diagnostics.Add(new(
            SlotShapeDiagnosticCode.LegacyActionPresentation,
            $"{path}.properties.{LegacyActionPresentation.Property}",
            $"The action '{LegacyOutletShape.Describe(value["id"])}' stores a presentation. {LegacyActionPresentation.MigrationHint}"));
    }

    static void CheckActionOpens(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (ActionOf(value, path) is not var (action, actionPath, name))
        {
            return;
        }

        var opens = action["opens"];
        if (IsUnknownOpens(opens))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.UnknownOpens,
                $"{actionPath}.opens",
                $"The action '{name}' opens '{LegacyOutletShape.Describe(opens)}'; an action opens automatically, runs directly (none), or opens in a dialog, a drawer or a slot"));
        }

        if (OpensSlotWithoutName(opens, action))
        {
            diagnostics.Add(new(
                SlotShapeDiagnosticCode.OpensSlotWithoutName,
                $"{actionPath}.opensIn",
                $"The action '{name}' opens in a slot but does not name one"));
        }
    }

    static bool IsButton(JsonObject value) =>
        string.Equals(LegacyOutletShape.Text(value["kind"]), "button", StringComparison.OrdinalIgnoreCase);

    static bool IsUnknownButtonDisplay(JsonNode? display) =>
        display is not null && (LegacyOutletShape.Text(display) is not { } shows || !_buttonDisplays.Contains(shows));

    static void CheckButtonDisplay(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        var display = value["display"];
        if (!IsButton(value) || !IsUnknownButtonDisplay(display))
        {
            return;
        }

        diagnostics.Add(new(
            SlotShapeDiagnosticCode.UnknownButtonDisplay,
            $"{path}.display",
            $"The button '{LegacyOutletShape.Describe(value["id"])}' shows '{LegacyOutletShape.Describe(display)}'; a button shows its icon and title (iconAndTitle), only its icon (icon) or only its title (title)"));
    }

    static void CheckPlacement(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        CheckActionPresentation(value, path, diagnostics);
        CheckActionOpens(value, path, diagnostics);
        CheckButtonDisplay(value, path, diagnostics);
        CheckScreenFits(value, path, diagnostics);
    }

    static void CheckScreenFits(JsonObject value, string path, List<SlotShapeDiagnostic> diagnostics)
    {
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

    static string OwnerNameOf(JsonObject owner) => LegacyOutletShape.Text(owner["name"]) ?? "(unnamed)";

    static void CheckToolbar(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (!LegacyOutletShape.IsToolbar(owner["toolbar"]))
        {
            return;
        }

        diagnostics.Add(new(
            SlotShapeDiagnosticCode.LegacyToolbarShape,
            $"{path}.toolbar",
            $"'{OwnerNameOf(owner)}' has a toolbar whose buttons every screen gets. {LegacyOutletShape.ToolbarMigrationHint}"));
    }

    static void CheckOutletItemLists(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        foreach (var key in _outletItemListKeys)
        {
            if (owner[key] is not JsonArray entries)
            {
                continue;
            }

            for (var index = 0; index < entries.Count; index++)
            {
                CheckOutletItemList(entries[index], $"{path}.{key}[{index}].items", diagnostics);
            }
        }
    }

    static void CheckOutletItemList(JsonNode? node, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (node is not JsonObject entry || entry["items"] is not JsonArray items)
        {
            return;
        }

        if (LegacyOutletShape.Text(entry["outlet"]) is { } outletName)
        {
            CheckOutletItems(items, new(outletName, null, null), path, diagnostics);
        }
    }

    static void CheckOutlet(JsonNode? node, string ownerName, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (node is not JsonObject outlet || LegacyOutletShape.Text(outlet["name"]) is not { } outletName)
        {
            return;
        }

        if (OutletKindOf(outlet["kind"]) is { } outletKind)
        {
            if (outlet["defaults"] is JsonArray defaults)
            {
                CheckOutletItems(defaults, new(outletName, outletKind, null), $"{path}.defaults", diagnostics);
            }

            return;
        }

        var described = outlet.ContainsKey("kind") ? $"the kind '{LegacyOutletShape.Describe(outlet["kind"])}'" : "no kind";
        diagnostics.Add(new(
            SlotShapeDiagnosticCode.UnknownOutletKind,
            $"{path}.kind",
            $"The outlet '{outletName}' of '{ownerName}' has {described}; an outlet lists actions, filters, tabs, stats or navigation"));
    }

    static void CheckOutlets(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        CheckToolbar(owner, path, diagnostics);
        CheckOutletItemLists(owner, path, diagnostics);

        if (owner["outlets"] is not JsonArray outlets || LegacyOutletShape.IsOutletList(outlets))
        {
            return;
        }

        var ownerName = OwnerNameOf(owner);
        for (var index = 0; index < outlets.Count; index++)
        {
            CheckOutlet(outlets[index], ownerName, $"{path}.outlets[{index}]", diagnostics);
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

    static void ReportUnknownItemKind(OutletItemContext context)
    {
        var described = context.Item.ContainsKey("kind") ? $"the kind '{LegacyOutletShape.Describe(context.Item["kind"])}'" : "no kind";
        context.Diagnostics.Add(new(
            SlotShapeDiagnosticCode.UnknownOutletItemKind,
            $"{context.Path}.kind",
            $"The item '{context.Named}' of the outlet '{context.Owner.Outlet}' has {described}; an outlet item is a button, menu entry, separator, group, filter, tab, stat or navigation item"));
    }

    static bool ReportMismatchedItemKind(OutletItemContext context, OutletItemKind kind)
    {
        var owner = context.Owner;
        var allowed = owner.Group is not null ? OutletItemKinds.InGroup : owner.Kind is { } outletKind ? OutletItemKinds.AllowedIn(outletKind) : null;
        if (allowed?.Contains(kind) != false)
        {
            return false;
        }

        var name = OutletItemKinds.NameOf(kind);
        var message = owner.Group is not null
            ? $"The {name} '{context.Named}' cannot go in the group '{owner.Group}' of the outlet '{owner.Outlet}', which takes buttons, menu entries and separators"
            : $"The {name} '{context.Named}' cannot go in the {OutletItemKinds.NameOf(owner.Kind!.Value)} outlet '{owner.Outlet}', which takes {OutletItemKinds.Describe(owner.Kind!.Value)}";
        context.Diagnostics.Add(new(SlotShapeDiagnosticCode.OutletItemKindMismatch, $"{context.Path}.kind", message));
        return true;
    }

    static bool IsBlank(JsonNode? value) => LegacyOutletShape.Text(value) is not { Length: > 0 };

    static void ReportIncompleteItem(OutletItemContext context, OutletItemKind kind, string field, string what) => context.Diagnostics.Add(new(
        SlotShapeDiagnosticCode.IncompleteOutletItem,
        $"{context.Path}.{field}",
        $"The {OutletItemKinds.NameOf(kind)} '{context.Named}' of the outlet '{context.Owner.Outlet}' has no {what}"));

    static void CheckOutletItemCompleteness(OutletItemContext context, OutletItemKind kind)
    {
        var item = context.Item;
        if (context.Id is null)
        {
            ReportIncompleteItem(context, kind, "id", "id");
        }

        if (kind != OutletItemKind.Separator && IsBlank(item["title"]))
        {
            ReportIncompleteItem(context, kind, "title", "title");
        }

        if (kind == OutletItemKind.Tab && IsBlank(item["shows"]))
        {
            ReportIncompleteItem(context, kind, "shows", "screen to show");
        }

        if (kind != OutletItemKind.Group)
        {
            return;
        }

        if (item["items"] is JsonArray children)
        {
            CheckOutletItems(children, context.Owner with { Group = context.Named }, $"{context.Path}.items", context.Diagnostics);
        }
        else
        {
            ReportIncompleteItem(context, kind, "items", "items");
        }
    }

    static void CheckOutletItem(JsonNode? node, string itemPath, OutletItemsOwner owner, List<SlotShapeDiagnostic> diagnostics)
    {
        if (node is not JsonObject item)
        {
            return;
        }

        var id = LegacyOutletShape.Text(item["id"]) is { Length: > 0 } text ? text : null;
        var context = new OutletItemContext(item, itemPath, id, id ?? "(no id)", owner, diagnostics);
        if (OutletItemKindOf(item["kind"]) is not { } kind)
        {
            ReportUnknownItemKind(context);
            return;
        }

        if (!ReportMismatchedItemKind(context, kind))
        {
            CheckOutletItemCompleteness(context, kind);
        }
    }

    static void CheckOutletItems(JsonArray items, OutletItemsOwner owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        for (var index = 0; index < items.Count; index++)
        {
            CheckOutletItem(items[index], $"{path}[{index}]", owner, diagnostics);
        }
    }

    static bool IsUnknownRole(JsonObject slot) =>
        slot.ContainsKey("role") && (LegacyOutletShape.Text(slot["role"]) is not { } role || !_roles.Contains(role));

    static void CheckSlotRole(SlotContext context)
    {
        if (!IsUnknownRole(context.Slot))
        {
            return;
        }

        context.Diagnostics.Add(new(
            SlotShapeDiagnosticCode.UnknownSlotRole,
            $"{context.Path}.role",
            $"The slot '{context.Name}' of '{context.OwnerName}' has the role '{LegacyOutletShape.Describe(context.Slot["role"])}'; a slot is a page, a pane or a panel"));
    }

    static void CheckSlotRouting(SlotContext context)
    {
        if (context.Slot["routedBy"] is not JsonArray { Count: > 0 } routedBy || IsTrue(context.Slot["routed"]))
        {
            return;
        }

        context.Diagnostics.Add(new(
            SlotShapeDiagnosticCode.RouteParametersWithoutRouting,
            $"{context.Path}.routedBy",
            $"The slot '{context.Name}' of '{context.OwnerName}' is routed by {string.Join(", ", routedBy.Select(LegacyOutletShape.Describe))} but is not routed"));
    }

    static void CheckSlots(JsonObject owner, string path, List<SlotShapeDiagnostic> diagnostics)
    {
        if (owner["slots"] is not JsonArray slots)
        {
            return;
        }

        var ownerName = OwnerNameOf(owner);
        var primaries = new List<string>();
        for (var index = 0; index < slots.Count; index++)
        {
            if (slots[index] is not JsonObject slot || LegacyOutletShape.Text(slot["name"]) is not { } slotName)
            {
                continue;
            }

            var context = new SlotContext(slot, slotName, ownerName, $"{path}.slots[{index}]", diagnostics);
            CheckSlotRole(context);
            CheckSlotRouting(context);
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

    sealed record OutletItemContext(JsonObject Item, string Path, string? Id, string Named, OutletItemsOwner Owner, List<SlotShapeDiagnostic> Diagnostics);

    sealed record SlotContext(JsonObject Slot, string Name, string OwnerName, string Path, List<SlotShapeDiagnostic> Diagnostics);
}
