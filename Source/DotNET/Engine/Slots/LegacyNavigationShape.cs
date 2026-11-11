// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Recognizes and upgrades the navigation shapes Scene 5 replaced with outlets of navigation: navigation models that list regions,
/// and navigation items contributed to contribution points. The TypeScript twin is <c language="csharp">upgradeNavigationShape</c>.
/// </summary>
public static class LegacyNavigationShape
{
    static readonly Dictionary<string, string> _modes = new(StringComparer.Ordinal)
    {
        ["inherit"] = "inherits",
        ["extend"] = "extends",
        ["override"] = "overrides",
    };

    /// <summary>
    /// Tells whether a value is a list of navigation regions: every entry names its <c language="json">region</c> and lists its <c language="json">items</c>.
    /// </summary>
    /// <param name="value">The value of a level's <c language="json">regions</c> key.</param>
    /// <returns>Whether it is a legacy region list.</returns>
    public static bool IsRegionList(JsonNode? value) =>
        value is JsonArray regions && regions.All(region => region is JsonObject entry && Text(entry["region"]) is not null && entry["items"] is JsonArray);

    /// <summary>
    /// Tells whether a value is a navigation model whose application and modules list navigation regions.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>Whether it is a legacy navigation model.</returns>
    public static bool IsNavigationModel(JsonNode? value) =>
        value is JsonObject model
        && model["application"] is JsonObject application
        && IsRegionList(application["regions"])
        && model["modules"] is JsonArray modules
        && modules.All(module => module is JsonObject entry && (!entry.ContainsKey("regions") || IsRegionList(entry["regions"])));

    /// <summary>
    /// Upgrades a navigation model from regions to outlets, in place. Each application region becomes an outlet of navigation named
    /// after it (its buttons the <c language="json">&lt;region&gt;Buttons</c> outlet of actions); each module region that extends or overrides
    /// becomes a refinement with the same mode and its items, and a region that inherits is dropped. A module region's buttons refine
    /// the buttons outlet with the region's mode; a region that overrides replaces the application's buttons too.
    /// </summary>
    /// <param name="navigation">The legacy navigation model.</param>
    public static void UpgradeNavigationModel(JsonObject navigation)
    {
        var application = navigation["application"]!.AsObject();
        var buttonRegions = new HashSet<string>(StringComparer.Ordinal);
        navigation["application"] = UpgradeApplication(application, buttonRegions);

        var modules = new JsonArray();
        foreach (var module in navigation["modules"]!.AsArray().OfType<JsonObject>())
        {
            modules.Add(module["regions"] is JsonArray regions ? UpgradeModule(module, regions, buttonRegions) : module.DeepClone());
        }

        navigation["modules"] = modules;
    }

    /// <summary>
    /// Tells whether a contribution is a navigation item contributed to a contribution point: content whose properties are a
    /// navigation item's (<c language="json">label</c> and <c language="json">targetScreen</c>).
    /// </summary>
    /// <param name="value">An entry of a screen's <c language="json">contributions</c>.</param>
    /// <returns>Whether it is a legacy navigation contribution.</returns>
    public static bool IsNavigationContribution(JsonNode? value) =>
        value is JsonObject contribution
        && Text(contribution["contributionPointName"]) is not null
        && contribution["content"] is JsonObject content
        && content["properties"] is JsonObject properties
        && Text(properties["label"]) is not null
        && Text(properties["targetScreen"]) is not null;

    /// <summary>
    /// Upgrades the navigation items an owner - a screen - contributes to contribution points into contributions to the outlets of
    /// navigation those points are, in its <c language="json">outletContributions</c>, in place. Items keep their declared order (items without
    /// one follow in the order given); items with a group become the sub-items of a navigation item named after the group, placed
    /// where the group's first item was. Every other contribution stays where it is.
    /// </summary>
    /// <param name="owner">The object with the <c language="json">contributions</c>.</param>
    /// <returns>Whether anything changed.</returns>
    public static bool UpgradeNavigationContributions(JsonObject owner)
    {
        if (owner["contributions"] is not JsonArray contributions || !contributions.Any(IsNavigationContribution))
        {
            return false;
        }

        var upgraded = new List<JsonNode?>();
        foreach (var (point, entries) in GroupByPoint(contributions))
        {
            upgraded.Add(new JsonObject { ["outlet"] = point, ["items"] = OrderedItems(entries) });
        }

        owner["contributions"] = new JsonArray([.. contributions.Where(contribution => !IsNavigationContribution(contribution)).Select(contribution => contribution?.DeepClone())]);
        var existing = owner["outletContributions"] is JsonArray current ? [.. current.Select(contribution => contribution?.DeepClone())] : new List<JsonNode?>();
        owner["outletContributions"] = new JsonArray([.. existing, .. upgraded]);
        return true;
    }

    static JsonObject UpgradeApplication(JsonObject application, HashSet<string> buttonRegions)
    {
        var outlets = new JsonArray();
        foreach (var region in application["regions"]!.AsArray().OfType<JsonObject>())
        {
            foreach (var outlet in OutletsOf(region, buttonRegions)) outlets.Add(outlet);
        }

        var upgraded = new JsonObject { ["outlets"] = outlets };
        foreach (var (key, value) in application.ToList())
        {
            if (key != "regions") upgraded[key] = value?.DeepClone();
        }

        return upgraded;
    }

    static List<JsonObject> OutletsOf(JsonObject region, HashSet<string> buttonRegions)
    {
        var name = Text(region["region"])!;
        var outlets = new List<JsonObject>
        {
            new()
            {
                ["name"] = name,
                ["kind"] = "navigation",
                ["defaults"] = new JsonArray([.. ItemsOf(region, "items").Select(NavigationItem)]),
            }
        };
        var buttons = ItemsOf(region, "buttons");
        if (buttons.Count > 0)
        {
            buttonRegions.Add(name);
            outlets.Add(new()
            {
                ["name"] = $"{name}Buttons",
                ["kind"] = "actions",
                ["defaults"] = new JsonArray([.. buttons.Select(Button)]),
            });
        }

        return outlets;
    }

    static JsonObject UpgradeModule(JsonObject module, JsonArray regions, HashSet<string> buttonRegions)
    {
        var refinements = RefinementsOf(regions, buttonRegions);
        var result = new JsonObject();
        foreach (var (key, value) in module.ToList())
        {
            if (key != "regions") result[key] = value?.DeepClone();
            else if (refinements.Count > 0) result["refinements"] = refinements;
        }

        return result;
    }

    static JsonArray RefinementsOf(JsonArray regions, HashSet<string> buttonRegions)
    {
        var refinements = new JsonArray();
        foreach (var region in regions.OfType<JsonObject>())
        {
            var name = Text(region["region"])!;
            var mode = _modes.GetValueOrDefault(Text(region["mode"]) ?? "inherit") ?? "inherits";
            if (mode == "inherits") continue;
            refinements.Add(Refinement(name, mode, ItemsOf(region, "items").Select(NavigationItem)));
            var buttons = ItemsOf(region, "buttons");
            if (RefinesButtons(buttons, mode == "overrides" && buttonRegions.Contains(name)))
            {
                refinements.Add(Refinement($"{name}Buttons", mode, buttons.Select(Button)));
            }
        }

        return refinements;
    }

    static bool RefinesButtons(List<JsonObject> buttons, bool replacesApplicationButtons) => buttons.Count > 0 || replacesApplicationButtons;

    static JsonObject Refinement(string outlet, string mode, IEnumerable<JsonObject> items) =>
        new() { ["outlet"] = outlet, ["mode"] = mode, ["items"] = new JsonArray([.. items]) };

    static List<(string Point, List<Contributed> Entries)> GroupByPoint(JsonArray contributions)
    {
        var byPoint = new List<(string Point, List<Contributed> Entries)>();
        var index = 0;
        foreach (var contribution in contributions)
        {
            if (IsNavigationContribution(contribution))
            {
                var point = Text(contribution!["contributionPointName"])!;
                var entries = byPoint.Find(entry => entry.Point == point).Entries;
                if (entries is null)
                {
                    entries = [];
                    byPoint.Add((point, entries));
                }

                entries.Add(Contribute(contribution.AsObject(), index));
            }

            index++;
        }

        return byPoint;
    }

    static JsonArray OrderedItems(List<Contributed> entries)
    {
        var ordered = entries
            .OrderBy(entry => entry.Order is null ? 1 : 0)
            .ThenBy(entry => entry.Order ?? 0)
            .ThenBy(entry => entry.Index);
        var items = new JsonArray();
        var groups = new Dictionary<string, JsonArray>(StringComparer.Ordinal);
        foreach (var entry in ordered) Append(items, groups, entry);

        return items;
    }

    static void Append(JsonArray items, Dictionary<string, JsonArray> groups, Contributed entry)
    {
        if (entry.Group is null)
        {
            items.Add(entry.Item);
            return;
        }

        if (!groups.TryGetValue(entry.Group, out var children))
        {
            children = [];
            groups[entry.Group] = children;
            items.Add(new JsonObject { ["kind"] = "navigation", ["id"] = entry.Group, ["title"] = entry.Group, ["children"] = children });
        }

        children.Add(entry.Item);
    }

    static JsonObject TargetOf(JsonObject properties, string targetScreen)
    {
        if (properties["destination"] is JsonObject destination) return destination.DeepClone().AsObject();

        var target = new JsonObject { ["screen"] = targetScreen };
        if (properties["routeParameterBindings"] is JsonObject bindings && bindings.Count > 0)
        {
            target["routeParameterBindings"] = bindings.DeepClone();
        }

        return target;
    }

    static Contributed Contribute(JsonObject contribution, int index)
    {
        var properties = contribution["content"]!["properties"]!.AsObject();
        var targetScreen = Text(properties["targetScreen"])!;
        var target = TargetOf(properties, targetScreen);

        var item = new JsonObject
        {
            ["kind"] = "navigation",
            ["id"] = Text(properties["id"]) ?? targetScreen,
            ["title"] = Text(properties["label"]),
        };
        if (Text(properties["icon"]) is { } icon) item["icon"] = icon;
        item["target"] = target;
        var order = Number(properties["order"]) ?? Number(contribution["order"]);
        return new(item, Text(properties["group"]), order, index);
    }

    static List<JsonObject> ItemsOf(JsonObject region, string key) => region[key] is JsonArray items ? [.. items.OfType<JsonObject>()] : [];

    static JsonObject NavigationItem(JsonObject item)
    {
        var result = new JsonObject { ["kind"] = "navigation", ["id"] = item["id"]?.DeepClone(), ["title"] = item["title"]?.DeepClone() };
        CopyIfPresent(item, result, "icon");
        CopyIfPresent(item, result, "target");
        CopyIfPresent(item, result, "slot");
        if (item["children"] is JsonArray children)
        {
            result["children"] = new JsonArray([.. children.OfType<JsonObject>().Select(NavigationItem)]);
        }

        return result;
    }

    static JsonObject Button(JsonObject button)
    {
        var result = new JsonObject { ["kind"] = "button", ["id"] = button["id"]?.DeepClone(), ["title"] = button["title"]?.DeepClone() };
        CopyIfPresent(button, result, "icon");
        CopyIfPresent(button, result, "slice");
        CopyIfPresent(button, result, "emphasis");
        CopyIfPresent(button, result, "authorize");
        return result;
    }

    static void CopyIfPresent(JsonObject from, JsonObject to, string key)
    {
        if (from.ContainsKey(key)) to[key] = from[key]?.DeepClone();
    }

    static string? Text(JsonNode? value) => value is JsonValue json && json.GetValueKind() == JsonValueKind.String ? json.GetValue<string>() : null;

    static double? Number(JsonNode? value) => value is JsonValue json && json.GetValueKind() == JsonValueKind.Number ? json.GetValue<double>() : null;

    sealed record Contributed(JsonObject Item, string? Group, double? Order, int Index);
}
