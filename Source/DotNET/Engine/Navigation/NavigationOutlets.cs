// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.ContributionPoints;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Navigation regions are outlets of navigation, and a region's buttons an outlet of actions: this is the one place that
/// says how. The TypeScript engine's <c language="typescript">navigationOutletLevels</c> builds the same chain.
/// </summary>
public static class NavigationOutlets
{
    /// <summary>
    /// The name of the level the application's navigation is declared at.
    /// </summary>
    public const string ApplicationLevel = "Application";

    /// <summary>
    /// Gets the name of the outlet of actions that holds a navigation region's buttons, such as <c language="screenplay">topbarButtons</c>.
    /// </summary>
    /// <param name="region">The region.</param>
    /// <returns>The outlet name.</returns>
    public static string ButtonsOutlet(NavigationRegionKind region) => $"{RegionOutlet(region)}Buttons";

    /// <summary>
    /// Gets the name of the outlet of navigation a region is, such as <c language="screenplay">sidebar</c>.
    /// </summary>
    /// <param name="region">The region.</param>
    /// <returns>The outlet name.</returns>
    public static string RegionOutlet(NavigationRegionKind region) => region.ToString().ToLowerInvariant();

    /// <summary>
    /// Turns an item of a navigation region into the item of the outlet of navigation the region is.
    /// </summary>
    /// <param name="item">The region item.</param>
    /// <returns>The outlet item.</returns>
    public static OutletNavigationItem AsOutletItem(NavItem item) => new()
    {
        Id = item.Id,
        Title = item.Title,
        Icon = item.Icon,
        Target = item.Target,
        Slot = item.Slot,
        Children = item.Children is null ? null : [.. item.Children.Select(AsOutletItem)],
    };

    /// <summary>
    /// Turns an item of an outlet of navigation back into a navigation region item.
    /// </summary>
    /// <param name="item">The outlet item.</param>
    /// <returns>The region item.</returns>
    public static NavItem AsNavItem(OutletNavigationItem item) =>
        new(item.Id, item.Title, item.Icon, item.Target, item.Slot, item.Children is null ? null : [.. item.Children.Select(AsNavItem)]);

    /// <summary>
    /// Turns a button of a navigation region into a button of an outlet of actions.
    /// </summary>
    /// <param name="button">The region button.</param>
    /// <returns>The outlet button.</returns>
    public static OutletButton AsOutletButton(NavigationButton button) => new()
    {
        Id = button.Id,
        Title = button.Title,
        Icon = button.Icon,
        Slice = button.Slice,
        Emphasis = button.Emphasis,
        Authorize = button.Authorize,
    };

    /// <summary>
    /// Builds the chain of outlet levels a navigation model is: the application declares an outlet of navigation per region
    /// (and an outlet of actions for the region's buttons), and a module refines them with the region's mode.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="module">The module to resolve for; <see langword="null"/> for the application.</param>
    /// <param name="moduleName">The name editors show for the module; the module id when <see langword="null"/>.</param>
    /// <returns>The levels, from the top down.</returns>
    public static IReadOnlyList<OutletLevel> Levels(NavigationModel navigation, string? module = null, string? moduleName = null)
    {
        var application = new OutletLevel(
            OutletLevelKind.Layout,
            ApplicationLevel,
            [.. NavigationRegions.Order.SelectMany(region =>
            {
                var declared = NavigationRegions.Find(navigation.Application.Regions, region);
                return new Outlet[]
                {
                    new(RegionOutlet(region), OutletKind.Navigation, [.. (declared?.Items ?? []).Select(AsOutletItem)]),
                    new(ButtonsOutlet(region), OutletKind.Actions, [.. (declared?.Buttons ?? []).Select(AsOutletButton)]),
                };
            })]);
        if (module is null) return [application];

        var regions = NavigationRegions.FindModule(navigation, module)?.Regions ?? [];
        return
        [
            application,
            new OutletLevel(
                OutletLevelKind.Module,
                moduleName ?? module,
                Refinements: [.. regions.SelectMany(region =>
                {
                    var mode = ModeOf(region.Mode ?? NavigationRegionMode.Inherit);
                    var inherits = mode == OutletMode.Inherits;
                    return new OutletRefinement[]
                    {
                        new(RegionOutlet(region.Region), mode, inherits ? null : [.. region.Items.Select(AsOutletItem)]),
                        new(ButtonsOutlet(region.Region), mode, inherits ? null : [.. (region.Buttons ?? []).Select(AsOutletButton)]),
                    };
                })])
        ];
    }

    /// <summary>
    /// Turns the items a screen contributes to a navigation contribution point into a contribution to the outlet of navigation
    /// of that name. Items keep their declared order; items without one follow in the order given.
    /// </summary>
    /// <param name="outlet">The name of the outlet of navigation - the contribution point's name.</param>
    /// <param name="items">The contributed navigation items.</param>
    /// <returns>The contribution.</returns>
    public static OutletContribution AsContribution(string outlet, IReadOnlyList<NavigationItem> items) =>
        new(outlet, [.. items
            .Select((item, index) => (item, index))
            .OrderBy(entry => entry.item.Order is null ? 1 : 0)
            .ThenBy(entry => entry.item.Order ?? 0)
            .ThenBy(entry => entry.index)
            .Select(entry => (OutletItem)new OutletNavigationItem
            {
                Id = entry.item.Id ?? entry.item.TargetScreen,
                Title = entry.item.Label,
                Icon = entry.item.Icon,
                Target = entry.item.Destination ?? new DestinationReference(Screen: entry.item.TargetScreen),
            })]);

    static OutletMode ModeOf(NavigationRegionMode mode) => mode switch
    {
        NavigationRegionMode.Extend => OutletMode.Extends,
        NavigationRegionMode.Override => OutletMode.Overrides,
        _ => OutletMode.Inherits,
    };
}
