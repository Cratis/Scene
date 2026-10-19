// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Looks things up in a <see cref="NavigationModel"/>.
/// </summary>
static class NavigationRegions
{
    /// <summary>
    /// The slot an item renders into when it names none: the primary outlet.
    /// </summary>
    public const string PrimarySlot = "content";

    /// <summary>
    /// The regions in the order every result lists them.
    /// </summary>
    public static readonly NavigationRegionKind[] Order = [NavigationRegionKind.Topbar, NavigationRegionKind.Sidebar];

    /// <summary>
    /// Finds what a level defines for a region.
    /// </summary>
    /// <param name="regions">The regions of the application or of a module.</param>
    /// <param name="region">The region to look for.</param>
    /// <returns>The region, or <see langword="null"/> when the level does not define it.</returns>
    public static NavigationRegion? Find(IReadOnlyList<NavigationRegion>? regions, NavigationRegionKind region) =>
        regions?.FirstOrDefault(candidate => candidate.Region == region);

    /// <summary>
    /// Finds what a module declares.
    /// </summary>
    /// <param name="navigation">The navigation.</param>
    /// <param name="module">The module id.</param>
    /// <returns>The module's navigation, or <see langword="null"/> when it declares nothing.</returns>
    public static ModuleNavigation? FindModule(NavigationModel navigation, string module) =>
        navigation.Modules.FirstOrDefault(candidate => candidate.Module == module);

    /// <summary>
    /// Gets the mode of a module's region: <see cref="NavigationRegionMode.Inherit"/> when the module does not declare the region or its mode.
    /// </summary>
    /// <param name="navigation">The navigation.</param>
    /// <param name="module">The module id.</param>
    /// <param name="region">The region.</param>
    /// <returns>The mode.</returns>
    public static NavigationRegionMode ModeOf(NavigationModel navigation, string module, NavigationRegionKind region) =>
        Find(FindModule(navigation, module)?.Regions, region)?.Mode ?? NavigationRegionMode.Inherit;

    /// <summary>
    /// Gets the application-level items of a region.
    /// </summary>
    /// <param name="application">The application navigation.</param>
    /// <param name="region">The region.</param>
    /// <returns>The items.</returns>
    public static IReadOnlyList<NavItem> ApplicationItems(ApplicationNavigation application, NavigationRegionKind region) =>
        Find(application.Regions, region)?.Items ?? [];

    /// <summary>
    /// Gets the items a level defines for a region.
    /// </summary>
    /// <param name="navigation">The navigation.</param>
    /// <param name="module">The module, or <see langword="null"/> for the application.</param>
    /// <param name="region">The region.</param>
    /// <returns>The items.</returns>
    public static IReadOnlyList<NavItem> OwnItems(NavigationModel navigation, string? module, NavigationRegionKind region) =>
        module is null ? ApplicationItems(navigation.Application, region) : Find(FindModule(navigation, module)?.Regions, region)?.Items ?? [];

    /// <summary>
    /// Gets the buttons a level defines for a region.
    /// </summary>
    /// <param name="navigation">The navigation.</param>
    /// <param name="module">The module, or <see langword="null"/> for the application.</param>
    /// <param name="region">The region.</param>
    /// <returns>The buttons.</returns>
    public static IReadOnlyList<NavigationButton> OwnButtons(NavigationModel navigation, string? module, NavigationRegionKind region) =>
        (module is null ? Find(navigation.Application.Regions, region) : Find(FindModule(navigation, module)?.Regions, region))?.Buttons ?? [];

    /// <summary>
    /// Collects every id in a list of items, depth first. Sub-items count only in the sidebar.
    /// </summary>
    /// <param name="items">The items.</param>
    /// <param name="region">The region they are in.</param>
    /// <returns>The ids.</returns>
    public static IEnumerable<string> CollectIds(IReadOnlyList<NavItem> items, NavigationRegionKind region) =>
        items.SelectMany(item => new[] { item.Id }.Concat(region == NavigationRegionKind.Sidebar ? CollectIds(item.Children ?? [], region) : []));
}
