// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Navigation;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Diagnoses the navigation regions of an application against its structure: duplicate item ids, targets that are missing, out of
/// scope or lead nowhere, and slots the layout does not declare. The application is checked first, then each module in the order
/// they are declared; within a level the topbar comes before the sidebar and items are visited depth first.
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">diagnoseNavigationRegions</c>) reports the same codes and messages in the same order;
/// both are asserted against <c language="csharp">navigation-inheritance-fixtures.json</c>, <c language="csharp">navigation-targets-fixtures.json</c>
/// and <c language="csharp">navigation-diagnostic-fixtures.json</c>.
/// </remarks>
public static class NavigationRegionDiagnostics
{
    /// <summary>
    /// Diagnoses the regions.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="navigation">The application and module regions.</param>
    /// <param name="slots">The rendering slots items may render into; <c language="csharp">content</c> only when <see langword="null"/>.</param>
    /// <returns>The problems found, in a stable order.</returns>
    public static IReadOnlyList<NavigationDiagnostic> Diagnose(ApplicationStructureIndex index, NavigationModel navigation, IReadOnlyList<string>? slots = null)
    {
        slots ??= [NavigationRegions.PrimarySlot];
        var diagnostics = new List<NavigationDiagnostic>();

        foreach (var region in NavigationRegions.Order)
        {
            if (NavigationRegions.Find(navigation.Application.Regions, region) is { } defined)
            {
                CheckRegion(index, slots, diagnostics, null, defined, [], []);
            }
        }

        foreach (var moduleNavigation in navigation.Modules)
        {
            foreach (var region in NavigationRegions.Order)
            {
                if (NavigationRegions.Find(moduleNavigation.Regions, region) is not { } defined)
                {
                    continue;
                }

                IReadOnlyList<string> inherited = defined.Mode == NavigationRegionMode.Extend
                    ? [.. NavigationRegions.CollectIds(NavigationRegions.ApplicationItems(navigation.Application, region), region)]
                    : [];
                IReadOnlyList<string> inheritedButtons = defined.Mode == NavigationRegionMode.Extend
                    ? [.. NavigationRegions.OwnButtons(navigation, null, region).Select(button => button.Id)]
                    : [];
                CheckRegion(index, slots, diagnostics, moduleNavigation.Module, defined, inherited, inheritedButtons);
            }
        }

        return diagnostics;
    }

    static string RegionName(NavigationRegionKind region) => region == NavigationRegionKind.Topbar ? "topbar" : "sidebar";

    static void CheckRegion(
        ApplicationStructureIndex index,
        IReadOnlyList<string> slots,
        List<NavigationDiagnostic> diagnostics,
        string? owner,
        NavigationRegion defined,
        IReadOnlyList<string> applicationIds,
        IReadOnlyList<string> applicationButtonIds)
    {
        var scope = owner is null ? "the application" : $"module '{owner}'";
        var region = RegionName(defined.Region);
        var seen = new HashSet<string>(StringComparer.Ordinal);

        void Visit(IReadOnlyList<NavItem> items)
        {
            foreach (var item in items)
            {
                var entry = $"{owner ?? "application"}:{region}:{item.Id}";
                void Report(NavigationDiagnosticCode code, string message) => diagnostics.Add(new(code, message, entry));

                if (seen.Contains(item.Id))
                {
                    Report(NavigationDiagnosticCode.NavDuplicateId, $"Navigation item '{item.Id}' is used more than once in {scope} {region}.");
                }
                else if (applicationIds.Contains(item.Id))
                {
                    Report(NavigationDiagnosticCode.NavDuplicateId, $"Navigation item '{item.Id}' in {scope} {region} is also used by an application item, and the region extends the application.");
                }

                seen.Add(item.Id);
                CheckTarget(index, owner, item, Report);

                var slot = item.Slot ?? NavigationRegions.PrimarySlot;
                if (!slots.Contains(slot))
                {
                    Report(NavigationDiagnosticCode.NavSlotUnknown, $"Navigation item '{item.Id}' renders into slot '{slot}', which the layout does not declare.");
                }

                if (defined.Region == NavigationRegionKind.Sidebar && item.Children is not null)
                {
                    Visit(item.Children);
                }
            }
        }

        Visit(defined.Items);
        CheckButtons(index, diagnostics, owner, scope, region, defined, applicationButtonIds);
    }

    static void CheckButtons(
        ApplicationStructureIndex index,
        List<NavigationDiagnostic> diagnostics,
        string? owner,
        string scope,
        string region,
        NavigationRegion defined,
        IReadOnlyList<string> applicationButtonIds)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var button in defined.Buttons ?? [])
        {
            var entry = $"{owner ?? "application"}:{region}:button:{button.Id}";

            if (seen.Contains(button.Id))
            {
                diagnostics.Add(new(NavigationDiagnosticCode.NavDuplicateId, $"Navigation button '{button.Id}' is used more than once in {scope} {region}.", entry));
            }
            else if (applicationButtonIds.Contains(button.Id))
            {
                diagnostics.Add(new(NavigationDiagnosticCode.NavDuplicateId, $"Navigation button '{button.Id}' in {scope} {region} is also used by an application button, and the region extends the application.", entry));
            }

            seen.Add(button.Id);

            if (!string.IsNullOrEmpty(button.Slice) && index.FindSlice(button.Slice) is null)
            {
                diagnostics.Add(new(NavigationDiagnosticCode.NavTargetMissing, $"Navigation button '{button.Id}' opens slice '{button.Slice}', which does not exist.", entry));
            }
        }
    }

    static void CheckTarget(ApplicationStructureIndex index, string? owner, NavItem item, Action<NavigationDiagnosticCode, string> report)
    {
        var module = item.Target?.Module;
        if (string.IsNullOrEmpty(module))
        {
            // A sidebar item that only groups sub-items needs no target of its own.
            if (item.Children is not { Count: > 0 })
            {
                report(NavigationDiagnosticCode.NavTargetMissing, $"Navigation item '{item.Id}' has no target.");
            }

            return;
        }

        if (index.FindModule(module) is null)
        {
            report(NavigationDiagnosticCode.NavTargetMissing, $"Navigation item '{item.Id}' targets module '{module}', which does not exist.");
            return;
        }

        if (owner is not null && module != owner)
        {
            report(NavigationDiagnosticCode.NavTargetOutOfScope, $"Navigation item '{item.Id}' of module '{owner}' targets module '{module}'; a module's own items may only target that module.");
            return;
        }

        var feature = item.Target?.Feature;
        if (!string.IsNullOrEmpty(feature))
        {
            if (index.FindFeature($"{module}.{feature}") is null)
            {
                report(NavigationDiagnosticCode.NavTargetMissing, $"Navigation item '{item.Id}' targets feature '{module}.{feature}', which does not exist.");
            }
        }
        else if (index.FirstFeature(module) is null)
        {
            report(NavigationDiagnosticCode.NavModuleWithoutFeatures, $"Navigation item '{item.Id}' targets module '{module}', which has no features to go to.");
        }
    }
}
