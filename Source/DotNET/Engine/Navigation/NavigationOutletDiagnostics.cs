// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Diagnoses the navigation outlets of an application against its structure: duplicate item ids, targets that are missing, out of
/// scope or lead nowhere, slots the layout does not declare, and buttons that open slices that do not exist. The application's outlets
/// are checked first, in the order they are declared, then each module in the order they are declared - its refinements, then its
/// contributions; items are visited depth first.
/// </summary>
/// <remarks>
/// Problems with the outlets themselves - a refinement of an outlet nobody declares, an item of the wrong kind, a hidden item that is
/// not there - are what <see cref="Outlets.OutletDiagnostics"/> reports over <see cref="NavigationOutlets.Levels"/>.
/// The TypeScript engine (<c language="csharp">diagnoseNavigationOutlets</c>) reports the same codes and messages in the same order;
/// both are asserted against <c language="csharp">navigation-inheritance-fixtures.json</c>, <c language="csharp">navigation-targets-fixtures.json</c>
/// and <c language="csharp">navigation-diagnostic-fixtures.json</c>.
/// </remarks>
public static class NavigationOutletDiagnostics
{
    /// <summary>
    /// Diagnoses the navigation outlets.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="navigation">The application's outlets and how each module refines them.</param>
    /// <param name="slots">The slots items may render into; <c language="csharp">content</c> only when <see langword="null"/>.</param>
    /// <returns>The problems found, in a stable order.</returns>
    public static IReadOnlyList<NavigationDiagnostic> Diagnose(ApplicationStructureIndex index, NavigationModel navigation, IReadOnlyList<string>? slots = null)
    {
        slots ??= [NavigationOutlets.PrimarySlot];
        var diagnostics = new List<NavigationDiagnostic>();

        foreach (var outlet in navigation.Application.Outlets ?? [])
        {
            Check(index, slots, diagnostics, null, outlet.Name, outlet.Kind, outlet.Defaults, []);
        }

        foreach (var moduleNavigation in navigation.Modules)
        {
            foreach (var refinement in moduleNavigation.Refinements ?? [])
            {
                if (NavigationOutlets.FindApplicationOutlet(navigation, refinement.Outlet) is not { } declared) continue;
                var inherited = NavigationOutlets.ModeOf(refinement) == OutletMode.Extends
                    ? NavigationOutlets.CollectIds(declared.Defaults, NavigationOutlets.AllowsSubItems(declared.Name, declared.Kind))
                    : [];
                Check(index, slots, diagnostics, moduleNavigation.Module, declared.Name, declared.Kind, refinement.Items ?? [], inherited);
            }

            foreach (var contribution in moduleNavigation.Contributions ?? [])
            {
                if (NavigationOutlets.FindApplicationOutlet(navigation, contribution.Outlet) is not { } declared) continue;
                Check(index, slots, diagnostics, moduleNavigation.Module, declared.Name, declared.Kind, contribution.Items, []);
            }
        }

        return diagnostics;
    }

    static void Check(
        ApplicationStructureIndex index,
        IReadOnlyList<string> slots,
        List<NavigationDiagnostic> diagnostics,
        string? owner,
        string outlet,
        OutletKind kind,
        IReadOnlyList<OutletItem> items,
        IReadOnlyList<string> inherited)
    {
        var scope = owner is null ? "the application" : $"module '{owner}'";
        var nested = NavigationOutlets.AllowsSubItems(outlet, kind);
        var seen = new HashSet<string>(StringComparer.Ordinal);

        void Visit(IEnumerable<OutletItem> level)
        {
            foreach (var item in level)
            {
                var entry = $"{owner ?? "application"}:{outlet}:{item.Id}";
                void Report(NavigationDiagnosticCode code, string message) => diagnostics.Add(new(code, message, entry));
                var isItem = item is OutletNavigationItem;
                var what = isItem ? "Navigation item" : "Navigation button";
                if (seen.Contains(item.Id))
                {
                    Report(NavigationDiagnosticCode.NavDuplicateId, $"{what} '{item.Id}' is used more than once in {scope} {outlet}.");
                }
                else if (inherited.Contains(item.Id))
                {
                    Report(NavigationDiagnosticCode.NavDuplicateId, $"{what} '{item.Id}' in {scope} {outlet} is also used by an application {(isItem ? "item" : "button")}, and the module extends the application's.");
                }

                seen.Add(item.Id);

                switch (item)
                {
                    case OutletNavigationItem navigationItem:
                        CheckItem(index, slots, owner, navigationItem, Report);
                        if (nested && navigationItem.Children is { } children) Visit(children);
                        break;
                    case OutletButton button:
                        if (!string.IsNullOrEmpty(button.Slice) && index.FindSlice(button.Slice) is null)
                        {
                            Report(NavigationDiagnosticCode.NavTargetMissing, $"Navigation button '{button.Id}' opens slice '{button.Slice}', which does not exist.");
                        }

                        break;
                }
            }
        }

        Visit(items);
    }

    static void CheckItem(ApplicationStructureIndex index, IReadOnlyList<string> slots, string? owner, OutletNavigationItem item, Action<NavigationDiagnosticCode, string> report)
    {
        CheckTarget(index, owner, item, report);
        var slot = item.Slot ?? NavigationOutlets.PrimarySlot;
        if (!slots.Contains(slot))
        {
            report(NavigationDiagnosticCode.NavSlotUnknown, $"Navigation item '{item.Id}' renders into slot '{slot}', which the layout does not declare.");
        }
    }

    static void CheckTarget(ApplicationStructureIndex index, string? owner, OutletNavigationItem item, Action<NavigationDiagnosticCode, string> report)
    {
        var module = item.Target?.Module;
        var hasChildren = item.Children is { Count: > 0 };
        if (string.IsNullOrEmpty(module))
        {
            // An item that only groups sub-items needs no target of its own, and a screen target is resolved by the host.
            if (!hasChildren && item.Target?.Screen is null)
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
