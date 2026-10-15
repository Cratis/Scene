// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Plans and applies the changes a user makes to navigation regions. Switching a module region to inherit clears its items (NAV3); switching
/// from inherit to override with a copy first copies the application's items (NAV5); adding an item to an inheriting region first switches it
/// to extend (NAV6); the logo is defined at the application level only (NAV8).
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">switchRegionMode</c>, <c language="csharp">addNavItem</c>, <c language="csharp">setApplicationLogo</c> and
/// <c language="csharp">applyNavigationEdits</c>) makes the same plans and results; both are asserted against <c language="csharp">navigation-inheritance-fixtures.json</c>.
/// </remarks>
public static class NavigationEdits
{
    const string NoMode = "The application is the base of the navigation and has no region mode.";
    const string LogoLevel = "The logo is defined at the application level only.";
    const string FlatTopbar = "A topbar is flat; only a sidebar item has sub-items.";

    /// <summary>
    /// Plans a change of a module region's mode.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module whose region changes; the application has no mode and is refused.</param>
    /// <param name="region">The region.</param>
    /// <param name="mode">The mode to switch to.</param>
    /// <param name="copy">Whether to copy the application items when switching from inherit to override.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan SwitchRegionMode(NavigationModel navigation, string? module, NavigationRegionKind region, NavigationRegionMode mode, bool copy = false)
    {
        if (module is null)
        {
            return new([], NoMode);
        }

        var current = NavigationRegions.ModeOf(navigation, module, region);
        if (current == mode)
        {
            return new([]);
        }

        var setMode = new NavigationEdit(NavigationEditKind.SetRegionMode, module, region, mode);
        if (mode == NavigationRegionMode.Inherit)
        {
            return new([new NavigationEdit(NavigationEditKind.SetRegionItems, module, region, Items: []), setMode]);
        }

        if (mode == NavigationRegionMode.Override && current == NavigationRegionMode.Inherit && copy)
        {
            return new([new NavigationEdit(NavigationEditKind.SetRegionItems, module, region, Items: NavigationRegions.ApplicationItems(navigation.Application, region)), setMode]);
        }

        return new([setMode]);
    }

    /// <summary>
    /// Plans adding an item to a region, after the ones already there.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module that gets the item; <see langword="null"/> for the application.</param>
    /// <param name="region">The region.</param>
    /// <param name="item">The item to add.</param>
    /// <param name="parent">The id of the item it becomes a sub-item of; sidebar only.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan AddNavItem(NavigationModel navigation, string? module, NavigationRegionKind region, NavItem item, string? parent = null)
    {
        if (parent is not null && region != NavigationRegionKind.Sidebar)
        {
            return new([], FlatTopbar);
        }

        var ids = NavigationRegions.CollectIds(NavigationRegions.OwnItems(navigation, module, region), region).ToList();
        if (ids.Contains(item.Id))
        {
            return new([], $"Navigation item id '{item.Id}' is already used in this region.");
        }

        if (parent is not null && !ids.Contains(parent))
        {
            return new([], $"There is no item '{parent}' to add a sub-item to.");
        }

        var add = new NavigationEdit(NavigationEditKind.AddItem, module, region, Parent: parent, Item: item);
        if (module is not null && NavigationRegions.ModeOf(navigation, module, region) == NavigationRegionMode.Inherit)
        {
            return new([new NavigationEdit(NavigationEditKind.SetRegionMode, module, region, NavigationRegionMode.Extend), add]);
        }

        return new([add]);
    }

    /// <summary>
    /// Plans setting the logo. The logo is defined at the application level only, so a module is refused.
    /// </summary>
    /// <param name="module">The module asking; only <see langword="null"/> (the application) is allowed.</param>
    /// <param name="logo">The logo.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan SetApplicationLogo(string? module, ApplicationLogo logo) =>
        module is null ? new([new NavigationEdit(NavigationEditKind.SetLogo, Logo: logo)]) : new([], LogoLevel);

    /// <summary>
    /// Applies navigation edits to the model. Either every edit applies, or none does.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="edits">The edits, in order.</param>
    /// <returns>The outcome.</returns>
    public static NavigationEditOutcome Apply(NavigationModel navigation, IReadOnlyList<NavigationEdit> edits)
    {
        var model = navigation;
        foreach (var edit in edits)
        {
            var (next, rejected) = ApplyOne(model, edit);
            if (rejected is not null)
            {
                return new(false, navigation, rejected);
            }

            model = next;
        }

        return new(true, model);
    }

    static (NavigationModel Model, string? Rejected) ApplyOne(NavigationModel model, NavigationEdit edit)
    {
        switch (edit.Kind)
        {
            case NavigationEditKind.SetRegionMode:
                return edit.Module is null ? (model, NoMode) : (UpdateRegion(model, edit.Module, edit.Region!.Value, region => region with { Mode = edit.Mode }), null);

            case NavigationEditKind.SetRegionItems:
                return (UpdateRegion(model, edit.Module, edit.Region!.Value, region => region with { Items = edit.Items ?? [] }), null);

            case NavigationEditKind.AddItem:
                return AddItem(model, edit);

            case NavigationEditKind.SetLogo:
                return edit.Module is not null ? (model, LogoLevel) : (model with { Application = model.Application with { Logo = edit.Logo } }, null);

            default:
                return (model, $"'{edit.Kind}' is not a navigation edit.");
        }
    }

    static (NavigationModel Model, string? Rejected) AddItem(NavigationModel model, NavigationEdit edit)
    {
        var kind = edit.Region!.Value;
        var item = edit.Item!;
        if (NavigationRegions.CollectIds(NavigationRegions.OwnItems(model, edit.Module, kind), kind).Contains(item.Id))
        {
            return (model, $"Navigation item id '{item.Id}' is already used in this region.");
        }

        if (edit.Parent is null)
        {
            return (UpdateRegion(model, edit.Module, kind, region => region with { Items = [.. region.Items, item] }), null);
        }

        if (kind != NavigationRegionKind.Sidebar)
        {
            return (model, FlatTopbar);
        }

        var added = false;
        var updated = UpdateRegion(model, edit.Module, kind, region => region with { Items = AddChild(region.Items, edit.Parent, item, ref added) });
        return added ? (updated, null) : (model, $"There is no item '{edit.Parent}' to add a sub-item to.");
    }

    static List<NavItem> AddChild(IReadOnlyList<NavItem> items, string parent, NavItem child, ref bool added)
    {
        var result = new List<NavItem>(items.Count);
        foreach (var item in items)
        {
            if (added)
            {
                result.Add(item);
            }
            else if (item.Id == parent)
            {
                added = true;
                result.Add(item with { Children = [.. item.Children ?? [], child] });
            }
            else
            {
                var children = AddChild(item.Children ?? [], parent, child, ref added);
                result.Add(added ? item with { Children = children } : item);
            }
        }

        return result;
    }

    static NavigationModel UpdateRegion(NavigationModel model, string? module, NavigationRegionKind kind, Func<NavigationRegion, NavigationRegion> update)
    {
        if (module is null)
        {
            return model with { Application = model.Application with { Regions = UpdateRegions(model.Application.Regions, kind, update) } };
        }

        var block = NavigationRegions.FindModule(model, module);
        if (block is null)
        {
            return model with { Modules = [.. model.Modules, new ModuleNavigation(module, UpdateRegions([], kind, update))] };
        }

        return model with
        {
            Modules = [.. model.Modules.Select(candidate => candidate.Module == module ? candidate with { Regions = UpdateRegions(candidate.Regions, kind, update) } : candidate)]
        };
    }

    static List<NavigationRegion> UpdateRegions(IReadOnlyList<NavigationRegion> regions, NavigationRegionKind kind, Func<NavigationRegion, NavigationRegion> update) =>
        regions.Any(region => region.Region == kind)
            ? [.. regions.Select(region => region.Region == kind ? update(region) : region)]
            : [.. regions, update(new NavigationRegion(kind, []))];
}
