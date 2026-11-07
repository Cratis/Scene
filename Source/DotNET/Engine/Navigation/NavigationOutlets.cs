// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Looks things up in a navigation model's outlets, and builds the chain of outlet levels it is: the application level
/// declares the outlets of its shell layout, and a module refines them and contributes to them. The TypeScript engine's
/// <c language="typescript">navigationOutlets</c> answers the same.
/// </summary>
public static class NavigationOutlets
{
    /// <summary>
    /// The name of the level the application's navigation is declared at.
    /// </summary>
    public const string ApplicationLevel = "Application";

    /// <summary>
    /// The slot an item renders into when it names none: the primary slot.
    /// </summary>
    public const string PrimarySlot = "content";

    /// <summary>
    /// The navigation regions in the order every result lists them; each is the name of an outlet of navigation.
    /// </summary>
    public static readonly NavigationRegionKind[] Order = [NavigationRegionKind.Topbar, NavigationRegionKind.Sidebar];

    /// <summary>
    /// Gets the name of the outlet of navigation a region is, such as <c language="screenplay">sidebar</c>.
    /// </summary>
    /// <param name="region">The region.</param>
    /// <returns>The outlet name.</returns>
    public static string RegionOutlet(NavigationRegionKind region) => region.ToString().ToLowerInvariant();

    /// <summary>
    /// Gets the name of the outlet of actions that holds a navigation outlet's buttons, such as <c language="screenplay">topbarButtons</c>.
    /// </summary>
    /// <param name="outlet">The name of the outlet of navigation.</param>
    /// <returns>The outlet name.</returns>
    public static string ButtonsOutlet(string outlet) => $"{outlet}Buttons";

    /// <summary>
    /// Gets the outlets the shell always offers, whether or not the application gives them default items: the
    /// <c language="screenplay">topbar</c> and <c language="screenplay">sidebar</c> outlets of navigation and their
    /// <c language="screenplay">topbarButtons</c> and <c language="screenplay">sidebarButtons</c> outlets of actions.
    /// </summary>
    /// <returns>The outlets, without defaults.</returns>
    public static IReadOnlyList<Outlet> Standard() =>
        [.. Order.SelectMany(region => new Outlet[]
        {
            new(RegionOutlet(region), OutletKind.Navigation, []),
            new(ButtonsOutlet(RegionOutlet(region)), OutletKind.Actions, []),
        })];

    /// <summary>
    /// Gets the outlets the application level offers: the ones it declares, followed by the standard ones it does not.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <returns>The outlets.</returns>
    public static IReadOnlyList<Outlet> ApplicationOutlets(NavigationModel navigation)
    {
        var declared = navigation.Application.Outlets ?? [];
        var names = declared.Select(outlet => outlet.Name).ToHashSet(StringComparer.Ordinal);
        return [.. declared, .. Standard().Where(outlet => !names.Contains(outlet.Name))];
    }

    /// <summary>
    /// Finds an outlet the application level offers, declared or standard.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="outlet">The outlet name.</param>
    /// <returns>The outlet, or <see langword="null"/> when the application offers none of that name.</returns>
    public static Outlet? FindApplicationOutlet(NavigationModel navigation, string outlet) =>
        ApplicationOutlets(navigation).FirstOrDefault(candidate => candidate.Name == outlet);

    /// <summary>
    /// Finds what a module declares.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="module">The module identity.</param>
    /// <returns>The module's navigation, or <see langword="null"/> when it declares nothing.</returns>
    public static ModuleNavigation? FindModule(NavigationModel navigation, string module) =>
        navigation.Modules.FirstOrDefault(candidate => candidate.Module == module);

    /// <summary>
    /// Finds how a module refines an outlet.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="module">The module identity.</param>
    /// <param name="outlet">The outlet name.</param>
    /// <returns>The refinement, or <see langword="null"/> when the module does not refine the outlet.</returns>
    public static OutletRefinement? FindRefinement(NavigationModel navigation, string module, string outlet) =>
        FindModule(navigation, module)?.Refinements?.FirstOrDefault(refinement => refinement.Outlet == outlet);

    /// <summary>
    /// Gets the mode a refinement resolves with: the one it states, or <see cref="OutletMode.Extends"/> when it adds or hides items
    /// and <see cref="OutletMode.Inherits"/> when it does neither - the rule outlet resolution applies.
    /// </summary>
    /// <param name="refinement">The refinement, or <see langword="null"/> for none.</param>
    /// <returns>The mode.</returns>
    public static OutletMode ModeOf(OutletRefinement? refinement) =>
        refinement is null
            ? OutletMode.Inherits
            : refinement.Mode ?? ((refinement.Items?.Count ?? 0) > 0 || (refinement.Hide?.Count ?? 0) > 0 ? OutletMode.Extends : OutletMode.Inherits);

    /// <summary>
    /// Gets how a module treats an outlet it inherits from the application: <see cref="OutletMode.Inherits"/> when it does not refine it.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="module">The module identity.</param>
    /// <param name="outlet">The outlet name.</param>
    /// <returns>The mode.</returns>
    public static OutletMode ModeOf(NavigationModel navigation, string module, string outlet) => ModeOf(FindRefinement(navigation, module, outlet));

    /// <summary>
    /// Gets the items a level puts in an outlet itself: the application's defaults, or a module's refinement items.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The outlet name.</param>
    /// <returns>The items, in order.</returns>
    public static IReadOnlyList<OutletItem> OwnItems(NavigationModel navigation, string? module, string outlet) =>
        module is null
            ? FindApplicationOutlet(navigation, outlet)?.Defaults ?? []
            : FindRefinement(navigation, module, outlet)?.Items ?? [];

    /// <summary>
    /// Tells whether items of an outlet may have sub-items: only items of an outlet of navigation other than the flat topbar.
    /// </summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="kind">What the outlet lists.</param>
    /// <returns>Whether sub-items are allowed.</returns>
    public static bool AllowsSubItems(string outlet, OutletKind? kind) =>
        kind == OutletKind.Navigation && outlet != RegionOutlet(NavigationRegionKind.Topbar);

    /// <summary>
    /// Gets the sub-items of an item: a navigation item's children; nothing for any other item.
    /// </summary>
    /// <param name="item">The item.</param>
    /// <returns>The sub-items.</returns>
    public static IReadOnlyList<OutletNavigationItem> ChildrenOf(OutletItem item) => item is OutletNavigationItem navigation ? navigation.Children ?? [] : [];

    /// <summary>
    /// Gets every id in a list of items, depth first. Sub-items count only where the outlet allows them.
    /// </summary>
    /// <param name="items">The items.</param>
    /// <param name="nested">Whether sub-items count.</param>
    /// <returns>The ids.</returns>
    public static IReadOnlyList<string> CollectIds(IEnumerable<OutletItem> items, bool nested) =>
        [.. items.SelectMany(item => new[] { item.Id }.Concat(nested ? CollectIds(ChildrenOf(item), nested) : []))];

    /// <summary>
    /// Builds the chain of outlet levels a navigation model is: the application level declares the outlets of its shell layout
    /// (and the standard ones it does not declare), and a module refines them and contributes to them.
    /// </summary>
    /// <param name="navigation">The navigation model.</param>
    /// <param name="module">The module to resolve for; <see langword="null"/> for the application.</param>
    /// <param name="moduleName">The name editors show for the module; the module id when <see langword="null"/>.</param>
    /// <returns>The levels, from the top down.</returns>
    public static IReadOnlyList<OutletLevel> Levels(NavigationModel navigation, string? module = null, string? moduleName = null)
    {
        var application = new OutletLevel(OutletLevelKind.Layout, ApplicationLevel, ApplicationOutlets(navigation));
        if (module is null) return [application];

        var declared = FindModule(navigation, module);
        return [application, new OutletLevel(OutletLevelKind.Module, moduleName ?? module, Refinements: declared?.Refinements, Contributions: declared?.Contributions)];
    }
}
