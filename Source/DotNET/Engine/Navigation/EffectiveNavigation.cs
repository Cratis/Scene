// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Navigation;

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
        var applicationOwned = NavigationRegions.ApplicationItems(navigation.Application, region);

        if (module is null)
        {
            return new(
                region,
                new NavigationSources(NavigationSourcesKind.DefinedHere, "defined here"),
                [.. applicationOwned.Select(item => ResolveItem(index, region, item, NavigationItemOrigin.Application, false, "Defined here."))]);
        }

        var mode = NavigationRegions.ModeOf(navigation, module, region);
        var moduleOwned = NavigationRegions.OwnItems(navigation, module, region);
        var name = index.FindModule(module)?.Name ?? module;

        List<EffectiveNavItem> Inherited() =>
            [.. applicationOwned.Select(item => ResolveItem(index, region, item, NavigationItemOrigin.Application, true, "Inherited from the application; edit it there."))];

        List<EffectiveNavItem> Own() =>
            [.. moduleOwned.Select(item => ResolveItem(index, region, item, NavigationItemOrigin.Module, false, $"Defined in {name}."))];

        return mode switch
        {
            NavigationRegionMode.Extend => new(region, new(NavigationSourcesKind.Extended, $"Application + {name}"), [.. Inherited(), .. Own()], module, mode),
            NavigationRegionMode.Override => new(region, new(NavigationSourcesKind.Overridden, $"{name} only"), Own(), module, mode),
            _ => new(region, new(NavigationSourcesKind.Inherited, "inherited"), Inherited(), module, NavigationRegionMode.Inherit)
        };
    }

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
