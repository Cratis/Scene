// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Resolves the items an outlet of navigation - a region such as the sidebar, or a contribution point - effectively shows, for
/// the application or for one module.
/// </summary>
/// <remarks>
/// <list type="bullet">
/// <item>Application (no module): the application's default items, editable, <c language="csharp">defined here</c>.</item>
/// <item><see cref="OutletMode.Inherits"/> (the default at a module): the application items, read-only.</item>
/// <item><see cref="OutletMode.Extends"/>: the application items, read-only, less the ones the module hides, followed by the module's items.</item>
/// <item><see cref="OutletMode.Overrides"/>: the module's items only.</item>
/// </list>
/// Items contributed to the outlet follow. The outlet's buttons - its <c language="csharp">&lt;outlet&gt;Buttons</c> outlet of actions - resolve
/// the same way, with whatever mode the module gives that outlet. The inheritance is resolved by <see cref="EffectiveOutlets"/> over
/// <see cref="NavigationOutlets.Levels"/>, so navigation and every other outlet share one rule and one provenance.
/// Each item carries its origin, whether it is read-only, a reason, and its target resolved against the structure: a module
/// target goes to the module's first feature. Sub-items belong to outlets other than the topbar; a topbar is flat and its sub-items are ignored.
/// The TypeScript engine (<c language="csharp">effectiveNavigation</c>) returns the same result; both are asserted against
/// <c language="csharp">navigation-inheritance-fixtures.json</c> and <c language="csharp">navigation-targets-fixtures.json</c>.
/// </remarks>
public static class EffectiveNavigation
{
    /// <summary>
    /// Resolves the effective items of a navigation region.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="navigation">The application's outlets and how each module refines them.</param>
    /// <param name="module">The module to resolve for; <see langword="null"/> for the application.</param>
    /// <param name="region">Which region to resolve.</param>
    /// <returns>The effective items and buttons.</returns>
    public static EffectiveNavigationRegion Resolve(ApplicationStructureIndex index, NavigationModel navigation, string? module, NavigationRegionKind region) =>
        Resolve(index, navigation, module, NavigationOutlets.RegionOutlet(region));

    /// <summary>
    /// Resolves the effective items of an outlet of navigation.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="navigation">The application's outlets and how each module refines them.</param>
    /// <param name="module">The module to resolve for; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The name of the outlet of navigation, such as <c language="csharp">sidebar</c>.</param>
    /// <returns>The effective items and buttons.</returns>
    public static EffectiveNavigationRegion Resolve(ApplicationStructureIndex index, NavigationModel navigation, string? module, string outlet)
    {
        var name = module is null ? null : index.FindModule(module)?.Name ?? module;
        var levels = NavigationOutlets.Levels(navigation, module, name);
        string ReasonOf(EffectiveOutletItem entry) => name is null
            ? "Defined here."
            : entry.Provenance.Level == OutletLevelKind.Layout ? "Inherited from the application; edit it there." : $"Defined in {name}.";
        var nested = NavigationOutlets.AllowsSubItems(outlet, NavigationOutlets.FindApplicationOutlet(navigation, outlet)?.Kind ?? OutletKind.Navigation);

        List<EffectiveNavItem> items = [.. EffectiveOutlets.Resolve(levels, outlet).Items
            .Where(entry => entry.Item is OutletNavigationItem)
            .Select(entry => ResolveItem(index, nested, (OutletNavigationItem)entry.Item, OriginOf(entry), !entry.Editable, ReasonOf(entry)))];
        var buttonsOutlet = NavigationOutlets.ButtonsOutlet(outlet);
        List<EffectiveNavButton> buttons = NavigationOutlets.FindApplicationOutlet(navigation, buttonsOutlet) is null
            ? []
            : [.. EffectiveOutlets.Resolve(levels, buttonsOutlet).Items
                .Where(entry => entry.Item is OutletButton)
                .Select(entry => ResolveButton((OutletButton)entry.Item, OriginOf(entry), !entry.Editable, ReasonOf(entry)))];

        if (module is null || name is null)
        {
            return new(outlet, new NavigationSources(NavigationSourcesKind.DefinedHere, "defined here"), items, Buttons: buttons);
        }

        var mode = NavigationOutlets.ModeOf(navigation, module, outlet);
        return mode switch
        {
            OutletMode.Extends => new(outlet, new(NavigationSourcesKind.Extended, $"Application + {name}"), items, module, mode, buttons),
            OutletMode.Overrides => new(outlet, new(NavigationSourcesKind.Overridden, $"{name} only"), items, module, mode, buttons),
            _ => new(outlet, new(NavigationSourcesKind.Inherited, "inherited"), items, module, OutletMode.Inherits, buttons)
        };
    }

    static NavigationItemOrigin OriginOf(EffectiveOutletItem entry) =>
        entry.Provenance.Level == OutletLevelKind.Layout ? NavigationItemOrigin.Application : NavigationItemOrigin.Module;

    static EffectiveNavButton ResolveButton(OutletButton button, NavigationItemOrigin origin, bool readOnly, string reason) =>
        new(button.Id, button.Title, button.Emphasis ?? ToolbarEmphasis.Secondary, origin, readOnly, reason, button.Icon, button.Slice, button.Authorize);

    static EffectiveNavItem ResolveItem(ApplicationStructureIndex index, bool nested, OutletNavigationItem item, NavigationItemOrigin origin, bool readOnly, string reason)
    {
        IReadOnlyList<EffectiveNavItem>? children = nested && item.Children is { Count: > 0 }
            ? [.. item.Children.Select(child => ResolveItem(index, nested, child, origin, readOnly, reason))]
            : null;

        return new(item.Id, item.Title, item.Slot ?? NavigationOutlets.PrimarySlot, origin, readOnly, reason, item.Icon, ResolveTarget(index, item), children);
    }

    static ResolvedNavigationTarget? ResolveTarget(ApplicationStructureIndex index, OutletNavigationItem item)
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
