// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Resolves an outlet for the last level of a chain. The first level that declares the outlet supplies its defaults; each
/// level below it inherits, extends (hiding some and adding its own after the inherited ones) or overrides (replacing the
/// inherited ones); then every contribution - from the chain and from the contributors - is added after all of those, as
/// contributions belong to someone else and overriding does not remove them. A level's own items never move above the ones
/// it inherits: before and after only order them among themselves, and before an inherited item puts it first after the
/// inherited ones. Contributions likewise only order among the contributions. A hide works on any item, including a
/// contributed one. An item without before or after goes last. The TypeScript engine's <c language="typescript">effectiveOutlet</c>
/// returns the same result; both are asserted against <c language="json">outlet-resolution-fixtures.json</c>.
/// </summary>
public static class EffectiveOutlets
{
    /// <summary>
    /// Resolves an outlet.
    /// </summary>
    /// <param name="chain">The levels from the top down, such as layout, template, module, feature and screen; the last is the level the outlet is resolved for.</param>
    /// <param name="outlet">The name of the outlet.</param>
    /// <param name="contributors">Levels outside the chain that may contribute to the outlet, such as another feature.</param>
    /// <returns>The resolved outlet, with provenance per item, what was hidden or overridden, a summary and diagnostics.</returns>
    public static EffectiveOutlet Resolve(IReadOnlyList<OutletLevel> chain, string outlet, IReadOnlyList<OutletLevel>? contributors = null)
    {
        var declaringIndex = FindDeclaringIndex(chain, outlet);
        if (declaringIndex < 0) return new(outlet, [], [], [], string.Empty, [OutletProblems.UnknownOutlet(outlet)]);

        var last = chain.Count - 1;
        var declaringLevel = chain[declaringIndex];
        var declaration = declaringLevel.Outlets!.First(candidate => candidate.Name == outlet);
        var resolution = new Resolution(outlet, declaration.Kind);
        CheckDeclaration(declaration, declaringLevel.Name, resolution.Diagnostics);

        var sources = new List<string> { declaringLevel.Name };
        var defaults = new OutletProvenance(declaringLevel.Name, declaringLevel.Kind, OutletItemSource.Default);
        foreach (var item in declaration.Defaults ?? []) Place(resolution, item, defaults, declaringIndex == last);

        var mode = RefineDownTheChain(resolution, chain, declaringIndex, sources);

        resolution.Floor = resolution.Items.Count;
        AddContributions(resolution, chain.Concat(contributors ?? []).ToList(), last, sources);
        HideContributions(resolution);

        return new(
            outlet,
            resolution.Items,
            resolution.Removed,
            sources,
            string.Join(" + ", sources),
            resolution.Diagnostics,
            declaration.Kind,
            declaration.Subject,
            declaration.Slot,
            declaringLevel.Name,
            mode);
    }

    static int FindDeclaringIndex(IReadOnlyList<OutletLevel> chain, string outlet)
    {
        for (var index = 0; index < chain.Count; index++)
        {
            if ((chain[index].Outlets ?? []).Any(candidate => candidate.Name == outlet)) return index;
        }
        return -1;
    }

    static OutletMode? RefineDownTheChain(Resolution resolution, IReadOnlyList<OutletLevel> chain, int declaringIndex, List<string> sources)
    {
        var last = chain.Count - 1;
        OutletMode? mode = null;
        for (var index = declaringIndex; index < chain.Count; index++)
        {
            var level = chain[index];
            var declarations = (level.Outlets ?? []).Count(candidate => candidate.Name == resolution.Outlet);
            var duplicates = index == declaringIndex ? declarations - 1 : declarations;
            for (var duplicate = 0; duplicate < duplicates; duplicate++)
            {
                resolution.Diagnostics.Add(OutletProblems.DuplicateOutlet(resolution.Outlet, level.Name, chain[declaringIndex].Name));
            }
            if (index == declaringIndex) continue;

            var levelMode = OutletMode.Inherits;
            foreach (var refinement in (level.Refinements ?? []).Where(candidate => candidate.Outlet == resolution.Outlet))
            {
                levelMode = Refine(resolution, level, refinement, index == last);
            }
            if (levelMode != OutletMode.Inherits && !sources.Contains(level.Name)) sources.Add(level.Name);
            if (index == last) mode = levelMode;
        }
        return mode;
    }

    static void AddContributions(Resolution resolution, List<OutletLevel> contributing, int last, List<string> sources)
    {
        for (var index = 0; index < contributing.Count; index++)
        {
            var level = contributing[index];
            var contributions = (level.Contributions ?? []).Where(candidate => candidate.Outlet == resolution.Outlet).ToList();
            if (contributions.Count == 0) continue;
            var provenance = new OutletProvenance(level.Name, level.Kind, OutletItemSource.Contribution);
            foreach (var item in contributions.SelectMany(contribution => contribution.Items ?? []))
            {
                Place(resolution, item, provenance, index == last);
            }
            if (!sources.Contains(level.Name)) sources.Add(level.Name);
        }
    }

    static void CheckDeclaration(Outlet declaration, string owner, List<OutletDiagnostic> diagnostics)
    {
        if (declaration.Kind == OutletKind.Tabs && string.IsNullOrEmpty(declaration.Slot))
        {
            diagnostics.Add(OutletProblems.TabsNeedSlot(declaration.Name, owner));
        }
        if (declaration.Kind != OutletKind.Actions && declaration.Subject is not null)
        {
            diagnostics.Add(OutletProblems.SubjectOnlyForActions(declaration.Name, declaration.Kind, owner));
        }
    }

    static OutletMode Refine(Resolution resolution, OutletLevel level, OutletRefinement refinement, bool editable)
    {
        var items = refinement.Items ?? [];
        var hide = refinement.Hide ?? [];
        var mode = refinement.Mode ?? (items.Count > 0 || hide.Count > 0 ? OutletMode.Extends : OutletMode.Inherits);
        if (mode == OutletMode.Inherits)
        {
            if (items.Count > 0 || hide.Count > 0) resolution.Diagnostics.Add(OutletProblems.ItemsIgnoredWhenInheriting(resolution.Outlet, level.Name));
            return mode;
        }

        foreach (var id in hide)
        {
            if (!TryHide(resolution, entry => entry.Item.Id == id, level.Name)) resolution.PendingHides.Add((id, level.Name));
        }

        if (mode == OutletMode.Overrides)
        {
            resolution.Removed.AddRange(resolution.Items.Select(entry => new RemovedOutletItem(entry.Item, entry.Provenance, OutletRemoval.Overridden, level.Name)));
            resolution.Items.Clear();
        }

        resolution.Floor = resolution.Items.Count;
        var provenance = new OutletProvenance(level.Name, level.Kind, OutletItemSource.Own);
        foreach (var item in items) Place(resolution, item, provenance, editable);
        return mode;
    }

    static void HideContributions(Resolution resolution)
    {
        foreach (var (id, owner) in resolution.PendingHides)
        {
            if (!TryHide(resolution, entry => entry.Item.Id == id && entry.Provenance.Source == OutletItemSource.Contribution, owner))
            {
                resolution.Diagnostics.Add(OutletProblems.HiddenItemMissing(resolution.Outlet, owner, id));
            }
        }
    }

    static bool TryHide(Resolution resolution, Predicate<EffectiveOutletItem> matches, string removedBy)
    {
        var index = resolution.Items.FindIndex(matches);
        if (index < 0) return false;
        var entry = resolution.Items[index];
        resolution.Items.RemoveAt(index);
        resolution.Removed.Add(new(entry.Item, entry.Provenance, OutletRemoval.Hidden, removedBy));
        return true;
    }

    static void Place(Resolution resolution, OutletItem item, OutletProvenance provenance, bool editable)
    {
        if (!Accepts(resolution, item, provenance)) return;

        var entry = new EffectiveOutletItem(KeepFittingChildren(resolution, item, provenance), provenance, editable);
        var (placement, target) = item.Before is not null ? ("before", item.Before) : item.After is not null ? ("after", item.After) : (null, null);
        if (placement is not null && target is not null && TryInsertNextTo(resolution, entry, item, provenance, placement, target)) return;
        resolution.Items.Add(entry);
    }

    static bool Accepts(Resolution resolution, OutletItem item, OutletProvenance provenance)
    {
        if (!OutletItemKinds.AllowedIn(resolution.Kind).Contains(item.Kind))
        {
            resolution.Diagnostics.Add(OutletProblems.ItemKindMismatch(resolution.Outlet, resolution.Kind, provenance.Owner, item));
            return false;
        }
        if (resolution.Items.Exists(entry => entry.Item.Id == item.Id))
        {
            resolution.Diagnostics.Add(OutletProblems.DuplicateItemId(resolution.Outlet, provenance.Owner, item.Id));
            return false;
        }
        return true;
    }

    static OutletItem KeepFittingChildren(Resolution resolution, OutletItem item, OutletProvenance provenance)
    {
        if (item is not OutletGroup group) return item;
        var kept = new List<OutletItem>();
        foreach (var child in group.Items)
        {
            if (OutletItemKinds.InGroup.Contains(child.Kind)) kept.Add(child);
            else resolution.Diagnostics.Add(OutletProblems.GroupItemKindMismatch(resolution.Outlet, provenance.Owner, group.Id, child));
        }
        return kept.Count != group.Items.Count ? group with { Items = kept } : item;
    }

    static bool TryInsertNextTo(Resolution resolution, EffectiveOutletItem entry, OutletItem item, OutletProvenance provenance, string placement, string target)
    {
        var index = resolution.Items.FindIndex(candidate => candidate.Item.Id == target);
        if (index < 0)
        {
            resolution.Diagnostics.Add(OutletProblems.PlacementTargetMissing(resolution.Outlet, provenance.Owner, item.Id, placement, target));
            return false;
        }

        var at = placement == "before" ? index : index + 1;
        if (at < resolution.Floor)
        {
            if (placement == "before") resolution.Diagnostics.Add(OutletProblems.PlacementAboveInherited(resolution.Outlet, provenance.Owner, item.Id, target));
            at = resolution.Floor;
        }
        resolution.Items.Insert(at, entry);
        return true;
    }

    sealed record Resolution(string Outlet, OutletKind Kind)
    {
        public List<EffectiveOutletItem> Items { get; } = [];

        public List<RemovedOutletItem> Removed { get; } = [];

        public List<OutletDiagnostic> Diagnostics { get; } = [];

        public List<(string Id, string Owner)> PendingHides { get; } = [];

        public int Floor { get; set; }
    }
}
