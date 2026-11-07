// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Resolves the items a navigation region effectively shows, for the application or for one module.
/// </summary>
/// <remarks>
/// <list type="bullet">
/// <item>Application (no module): the application items, editable, <c language="csharp">defined here</c>.</item>
/// <item><see cref="NavigationRegionMode.Inherit"/> (the default at a module): the application items, read-only; the module's own items are cleared.</item>
/// <item><see cref="NavigationRegionMode.Extend"/>: the application items, read-only, followed by the module's items.</item>
/// <item><see cref="NavigationRegionMode.Override"/>: the module's items only.</item>
/// </list>
/// The region's application-level toolbar buttons follow the same modes: inherit, extend and override.
/// A navigation region is an outlet of navigation (and its buttons an outlet of actions): the inheritance is resolved by
/// <see cref="EffectiveOutlets"/> over <see cref="NavigationOutlets.Levels"/>, so navigation and every other outlet share one rule.
/// Each item carries its origin, whether it is read-only, a reason, and its target resolved against the structure: a module
/// target goes to the module's first feature. Sub-items belong to the sidebar; a topbar is flat and its sub-items are ignored.
/// The TypeScript engine (<c language="csharp">effectiveNavigation</c>) returns the same result; both are asserted against
/// <c language="csharp">navigation-inheritance-fixtures.json</c> and <c language="csharp">navigation-targets-fixtures.json</c>.
/// </remarks>
public static class EffectiveNavigation
{
    /// <summary>
    /// Resolves the effective items of a region.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="navigation">The application and module regions.</param>
    /// <param name="module">The module to resolve for; <see langword="null"/> for the application.</param>
    /// <param name="region">Which region to resolve.</param>
    /// <returns>The effective region.</returns>
    public static EffectiveNavigationRegion Resolve(ApplicationStructureIndex index, NavigationModel navigation, string? module, NavigationRegionKind region)
    {
        var name = module is null ? null : index.FindModule(module)?.Name ?? module;
        var levels = NavigationOutlets.Levels(navigation, module, name);
        string ReasonOf(EffectiveOutletItem entry) => name is null
            ? "Defined here."
            : entry.Provenance.Level == OutletLevelKind.Layout ? "Inherited from the application; edit it there." : $"Defined in {name}.";

        List<EffectiveNavItem> items = [.. EffectiveOutlets.Resolve(levels, NavigationOutlets.RegionOutlet(region)).Items
            .Select(entry => ResolveItem(index, region, NavigationOutlets.AsNavItem((OutletNavigationItem)entry.Item), OriginOf(entry), !entry.Editable, ReasonOf(entry)))];
        List<EffectiveNavButton> buttons = [.. EffectiveOutlets.Resolve(levels, NavigationOutlets.ButtonsOutlet(region)).Items
            .Select(entry => ResolveButton((OutletButton)entry.Item, OriginOf(entry), !entry.Editable, ReasonOf(entry)))];

        if (module is null || name is null)
        {
            return new(region, new NavigationSources(NavigationSourcesKind.DefinedHere, "defined here"), items, Buttons: buttons);
        }

        var mode = NavigationRegions.ModeOf(navigation, module, region);
        return mode switch
        {
            NavigationRegionMode.Extend => new(region, new(NavigationSourcesKind.Extended, $"Application + {name}"), items, module, mode, buttons),
            NavigationRegionMode.Override => new(region, new(NavigationSourcesKind.Overridden, $"{name} only"), items, module, mode, buttons),
            _ => new(region, new(NavigationSourcesKind.Inherited, "inherited"), items, module, NavigationRegionMode.Inherit, buttons)
        };
    }

    static NavigationItemOrigin OriginOf(EffectiveOutletItem entry) =>
        entry.Provenance.Level == OutletLevelKind.Layout ? NavigationItemOrigin.Application : NavigationItemOrigin.Module;

    static EffectiveNavButton ResolveButton(OutletButton button, NavigationItemOrigin origin, bool readOnly, string reason) =>
        new(button.Id, button.Title, button.Emphasis ?? ToolbarEmphasis.Secondary, origin, readOnly, reason, button.Icon, button.Slice, button.Authorize);

    static EffectiveNavItem ResolveItem(ApplicationStructureIndex index, NavigationRegionKind region, NavItem item, NavigationItemOrigin origin, bool readOnly, string reason)
    {
        IReadOnlyList<EffectiveNavItem>? children = region == NavigationRegionKind.Sidebar && item.Children is { Count: > 0 }
            ? [.. item.Children.Select(child => ResolveItem(index, region, child, origin, readOnly, reason))]
            : null;

        return new(item.Id, item.Title, item.Slot ?? NavigationRegions.PrimarySlot, origin, readOnly, reason, item.Icon, ResolveTarget(index, item), children);
    }

    static ResolvedNavigationTarget? ResolveTarget(ApplicationStructureIndex index, NavItem item)
    {
        var module = item.Target?.Module;
        if (string.IsNullOrEmpty(module))
        {
            return null;
        }

        var feature = item.Target?.Feature;
        if (!string.IsNullOrEmpty(feature))
        {
            return new(module, feature, index.FindFeature($"{module}.{feature}") is null ? null : $"{module}.{feature}");
        }

        return new(module, null, index.FirstFeatureId(module));
    }
}
