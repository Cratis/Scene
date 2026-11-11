// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The package list of a UI profile, the way a designer shows it.
/// </summary>
/// <remarks>
/// <para>
/// <see cref="UiProfile.Packages"/> is stored in ascending priority: the first entry is the weakest, the last wins a shared component name, and
/// <c language="csharp">core</c> is the final fallback every name resolves against. A designer lists the strongest first, so its position 1 is the end
/// of the stored list and <c language="csharp">core</c> is always its last row. Everything here speaks in the designer's order (rows, up, down) and writes the stored order.
/// </para>
/// <para>
/// A package that depends on another is always stronger than it (it comes later in the stored list); every edit keeps that true. The TypeScript engine has the same
/// functions, asserted against the same corpus.
/// </para>
/// </remarks>
public static class PackageList
{
    /// <summary>
    /// Gets the blueprint package of the profile's current shell, when its root template is a blueprint template.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <returns>The blueprint package name, or <see langword="null"/>.</returns>
    public static string? ShellBlueprintOf(UiProfile profile) =>
        profile.Root?.Template.Source == TemplateReferenceSource.Blueprint ? profile.Root.Template.Blueprint : null;

    /// <summary>
    /// Describes the package list of a profile: the rows in the designer's order with reasons, move and removal rules, the packages that can be added
    /// with what each would also add, and who supplies every component.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="catalog">Every package that could be listed.</param>
    /// <returns>The rows, the addable packages and the supplier table.</returns>
    public static PackageListing Describe(UiProfile profile, IReadOnlyList<ScenePackage> catalog)
    {
        var index = IndexOf(catalog);
        var stored = StoredOf(profile);
        List<string> names = [.. Enumerable.Reverse(stored)];
        var shell = ShellBlueprintOf(profile);

        var context = new RowContext(names, stored, shell, index);
        var rows = names.Select((name, at) => RowOf(name, at, context)).ToList();
        var addable = AddableOf(catalog, stored.ToHashSet(StringComparer.Ordinal), index);
        return new PackageListing(rows, addable, SuppliersOf(names, index));
    }

    /// <summary>
    /// Adds a package and everything it depends on, just above <c language="csharp">core</c>.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="catalog">Every package that could be listed.</param>
    /// <param name="name">The package to add.</param>
    /// <returns>The edit; refused when the package or something it needs is not in the catalog.</returns>
    public static PackageEdit Add(UiProfile profile, IReadOnlyList<ScenePackage> catalog, string name)
    {
        var index = IndexOf(catalog);
        var stored = StoredOf(profile);
        if (stored.Contains(name))
        {
            return Unchanged(profile);
        }

        if (!index.ContainsKey(name))
        {
            return Refused(profile, $"Package '{name}' is not available.");
        }

        var (order, unknown) = ClosureOf(name, stored.ToHashSet(StringComparer.Ordinal), index);
        if (unknown.Count > 0)
        {
            return Refused(profile, NeedsMessage($"Package '{NameOf(index, name)}'", unknown));
        }

        var added = order.ConvertAll(item => NameOf(index, item));
        var own = NameOf(index, name);
        return new PackageEdit(
            WithPackages(profile, InsertAboveCore(stored, order, index)),
            PackageEditOutcome.Added,
            order,
            [],
            added.Count == 1 ? $"Added {added[0]}." : $"Added {own} with {string.Join(", ", added.Where(item => item != own))}.");
    }

    /// <summary>
    /// Removes a package. <c language="csharp">core</c>, a package another listed package needs and the blueprint of the current shell cannot be removed; the answer names why.
    /// The theme is never touched: a theme that needed the package becomes a problem the engine reports, not a silent change.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="catalog">Every package that could be listed.</param>
    /// <param name="name">The package to remove.</param>
    /// <returns>The edit.</returns>
    public static PackageEdit Remove(UiProfile profile, IReadOnlyList<ScenePackage> catalog, string name)
    {
        var index = IndexOf(catalog);
        var stored = StoredOf(profile);
        if (!stored.Contains(name))
        {
            return Unchanged(profile);
        }

        var row = Describe(profile, catalog).Rows.First(candidate => candidate.Name == name);
        if (row.Lock is not null)
        {
            return Refused(profile, row.Lock.Text);
        }

        return new PackageEdit(WithPackages(profile, [.. stored.Where(candidate => candidate != name)]), PackageEditOutcome.Removed, [], [name], $"Removed {NameOf(index, name)}.");
    }

    /// <summary>
    /// Moves a package one row up or down in the designer's list.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="catalog">Every package that could be listed.</param>
    /// <param name="name">The package to move.</param>
    /// <param name="direction">Up makes it stronger.</param>
    /// <returns>The edit; refused when <c language="csharp">core</c> is moved, unchanged when the move would put a package below one it depends on or past <c language="csharp">core</c>.</returns>
    public static PackageEdit Move(UiProfile profile, IReadOnlyList<ScenePackage> catalog, string name, MoveDirection direction)
    {
        var index = IndexOf(catalog);
        var stored = StoredOf(profile);
        if (!stored.Contains(name))
        {
            return Unchanged(profile);
        }

        if (name == PackageResolver.Core)
        {
            return Refused(profile, $"{NameOf(index, name)} is always last and cannot be moved.");
        }

        if (!MoveIsValid(stored, name, direction, index))
        {
            return Unchanged(profile);
        }

        var at = stored.IndexOf(name);
        var other = direction == MoveDirection.Up ? at + 1 : at - 1;
        (stored[at], stored[other]) = (stored[other], stored[at]);
        return new PackageEdit(WithPackages(profile, stored), PackageEditOutcome.Moved, [], [], $"Moved {NameOf(index, name)} {(direction == MoveDirection.Up ? "up" : "down")}.");
    }

    /// <summary>
    /// Chooses the blueprint of the shell: the blueprint package moves to position 1 (the strongest), the previous shell blueprint leaves the list when
    /// nothing else needs it, and the root template becomes the blueprint's shell.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="catalog">Every package that could be listed.</param>
    /// <param name="blueprint">The blueprint package to choose.</param>
    /// <param name="shell">The blueprint template that is the shell; <see langword="null"/> for the blueprint's first layout.</param>
    /// <returns>The edit; refused when the package is not a blueprint, or has no shell to offer.</returns>
    public static PackageEdit ChooseBlueprint(UiProfile profile, IReadOnlyList<ScenePackage> catalog, string blueprint, string? shell = null)
    {
        var index = IndexOf(catalog);
        if (!index.TryGetValue(blueprint, out var scenePackage) || scenePackage.Kind != PackageKind.Blueprint)
        {
            return Refused(profile, $"Package '{blueprint}' is not a blueprint.");
        }

        var shellId = shell ?? (scenePackage.Layouts.Count > 0 ? scenePackage.Layouts[0] : null);
        if (shellId is null)
        {
            return Refused(profile, $"{NameOf(index, blueprint)} has no shell to offer.");
        }

        var (stored, removed) = RetirePreviousShell(StoredOf(profile), ShellBlueprintOf(profile), blueprint, index);
        var (order, unknown) = ClosureOf(blueprint, stored.ToHashSet(StringComparer.Ordinal), index);
        if (unknown.Count > 0)
        {
            return Refused(profile, NeedsMessage(NameOf(index, blueprint), unknown));
        }

        var added = order.Where(item => item != blueprint).ToList();
        stored = PlaceBlueprint(InsertAboveCore(stored, added, index), blueprint, added, index);

        var template = new TemplateReference(TemplateReferenceSource.Blueprint, shellId, blueprint, ProfileMigrator.PinOf(scenePackage.Version));
        var next = WithPackages(profile, stored) with { Root = new RootTemplate(template, profile.Root?.Options) };
        return new PackageEdit(next, PackageEditOutcome.Changed, added, removed, $"Shell set to {NameOf(index, blueprint)}.");
    }

    /// <summary>
    /// Chooses a theme. When the theme comes from a package that is not listed, the package is added with what it needs.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="catalog">Every package that could be listed.</param>
    /// <param name="theme">The name of the theme.</param>
    /// <returns>The edit.</returns>
    public static PackageEdit ChooseTheme(UiProfile profile, IReadOnlyList<ScenePackage> catalog, string theme)
    {
        var supplier = catalog.FirstOrDefault(item => item.Themes.Contains(theme));
        var listed = supplier is not null && StoredOf(profile).Contains(supplier.Name);
        var chosen = profile with { Theme = theme };
        if (supplier is null || listed)
        {
            return new PackageEdit(chosen, profile.Theme == theme ? PackageEditOutcome.Unchanged : PackageEditOutcome.Changed, [], [], string.Empty);
        }

        var added = Add(chosen, catalog, supplier.Name);
        return added.Outcome == PackageEditOutcome.Added
            ? added with { Outcome = PackageEditOutcome.Changed, Message = $"Theme '{theme}' needs {NameOf(IndexOf(catalog), supplier.Name)}, which was added." }
            : added with { Profile = chosen, Outcome = PackageEditOutcome.Changed };
    }

    static PackageRow RowOf(string name, int at, RowContext context)
    {
        var (names, stored, shell, index) = context;
        index.TryGetValue(name, out var item);
        var needed = names.Where(other => other != name && DependenciesOf(other, index).Contains(name)).Select(other => NameOf(index, other)).ToList();
        var displayName = NameOf(index, name);
        var (reason, packageLock) = ReasonOf(name, shell, displayName, needed);
        return new PackageRow(
            at + 1,
            name,
            displayName,
            item?.Version ?? string.Empty,
            item?.Kind ?? PackageKind.ComponentLibrary,
            item?.Description,
            reason,
            name != PackageResolver.Core && at > 0 && MoveIsValid(stored, name, MoveDirection.Up, index),
            name != PackageResolver.Core && at < names.Count - 1 && MoveIsValid(stored, name, MoveDirection.Down, index),
            packageLock);
    }

    static (PackageReason Reason, PackageLock? Lock) ReasonOf(string name, string? shell, string displayName, List<string> needed)
    {
        if (name == PackageResolver.Core)
        {
            return (new(PackageReasonKind.AlwaysLast, [], "Always last"), new(PackageLockKind.Core, [], $"{displayName} is the fallback every component name resolves against, so it is always last and cannot be removed."));
        }

        if (name == shell)
        {
            return (new(PackageReasonKind.UsedByShell, [], "Used by Shell"), new(PackageLockKind.Shell, [], $"{displayName} is the blueprint of the current shell, so it stays while it is the shell."));
        }

        if (needed.Count > 0)
        {
            return (new(PackageReasonKind.NeededBy, needed, $"Needed by {string.Join(", ", needed)}"), new(PackageLockKind.NeededBy, needed, $"{displayName} is needed by {string.Join(", ", needed)}, so it stays while they are listed."));
        }

        return (new(PackageReasonKind.Chosen, [], "Chosen"), null);
    }

    static List<AddablePackage> AddableOf(IReadOnlyList<ScenePackage> catalog, HashSet<string> listed, Dictionary<string, ScenePackage> index) =>
        [.. catalog.Where(item => !listed.Contains(item.Name)).Select(item =>
        {
            var alsoAdds = ClosureOf(item.Name, listed, index).Order.Where(name => name != item.Name).Select(name => NameOf(index, name)).ToList();
            return new AddablePackage(item.Name, NameOf(index, item.Name), item.Version, item.Kind, item.Description, alsoAdds, alsoAdds.Count == 0 ? string.Empty : $"Also adds {string.Join(", ", alsoAdds)}");
        })];

    static List<ComponentSupplier> SuppliersOf(List<string> names, Dictionary<string, ScenePackage> index)
    {
        var byComponent = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (var name in names)
        {
            foreach (var component in index.TryGetValue(name, out var item) ? item.Components : [])
            {
                if (!byComponent.TryGetValue(component, out var suppliers))
                {
                    byComponent[component] = suppliers = [];
                }

                if (!suppliers.Contains(name))
                {
                    suppliers.Add(name);
                }
            }
        }

        return [.. byComponent
            .OrderBy(pair => pair.Key, StringComparer.Ordinal)
            .Select(pair => new ComponentSupplier(pair.Key, pair.Value[0], pair.Value.Skip(1).ToList()))];
    }

    static string NeedsMessage(string subject, List<string> unknown) =>
        $"{subject} needs {string.Join(", ", unknown.Select(item => $"'{item}'"))}, which {(unknown.Count == 1 ? "is" : "are")} not available.";

    static (List<string> Stored, List<string> Removed) RetirePreviousShell(List<string> stored, string? previous, string blueprint, Dictionary<string, ScenePackage> index)
    {
        if (previous is null || !IsRetirable(stored, previous, blueprint))
        {
            return (stored, []);
        }

        var needed = stored.Exists(other => other != previous && DependenciesOf(other, index).Contains(previous));
        return needed ? (stored, []) : ([.. stored.Where(candidate => candidate != previous)], [previous]);
    }

    static bool IsRetirable(List<string> stored, string previous, string blueprint) => previous != blueprint && stored.Contains(previous);

    static List<string> PlaceBlueprint(List<string> stored, string blueprint, List<string> added, Dictionary<string, ScenePackage> index)
    {
        var dependedOn = stored.Exists(other => other != blueprint && DependenciesOf(other, index).Contains(blueprint));
        if (!stored.Contains(blueprint))
        {
            stored.Add(blueprint);
            added.Add(blueprint);
            return stored;
        }

        return dependedOn ? stored : [.. stored.Where(candidate => candidate != blueprint), blueprint];
    }

    static Dictionary<string, ScenePackage> IndexOf(IReadOnlyList<ScenePackage> catalog)
    {
        var index = new Dictionary<string, ScenePackage>(StringComparer.Ordinal);
        foreach (var item in catalog)
        {
            index[item.Name] = item;
        }

        return index;
    }

    static string NameOf(Dictionary<string, ScenePackage> index, string name) =>
        index.TryGetValue(name, out var item) ? item.DisplayName ?? item.Name : name;

    static List<string> StoredOf(UiProfile profile) =>
        profile.Packages.Contains(PackageResolver.Core) ? [.. profile.Packages] : [PackageResolver.Core, .. profile.Packages];

    static List<string> DependenciesOf(string name, Dictionary<string, ScenePackage> index) =>
        index.TryGetValue(name, out var item) ? [.. item.Dependencies.Select(dependency => dependency.Name).Distinct(StringComparer.Ordinal)] : [];

    static bool IsOrdered(List<string> stored, Dictionary<string, ScenePackage> index) =>
        stored.Select((name, position) => (name, position)).ToList().TrueForAll(entry =>
            DependenciesOf(entry.name, index).TrueForAll(dependency => !stored.Contains(dependency) || stored.IndexOf(dependency) < entry.position));

    static (List<string> Order, List<string> Unknown) ClosureOf(string name, HashSet<string> listed, Dictionary<string, ScenePackage> index)
    {
        List<string> order = [];
        List<string> unknown = [];
        var visiting = new HashSet<string>(StringComparer.Ordinal);

        bool IsVisited(string current) => order.Contains(current) || visiting.Contains(current);

        void Visit(string current)
        {
            if (listed.Contains(current) || IsVisited(current))
            {
                return;
            }

            if (!index.ContainsKey(current))
            {
                if (!unknown.Contains(current))
                {
                    unknown.Add(current);
                }

                return;
            }

            visiting.Add(current);
            foreach (var dependency in DependenciesOf(current, index))
            {
                Visit(dependency);
            }

            visiting.Remove(current);
            order.Add(current);
        }

        Visit(name);
        return (order, unknown);
    }

    static List<string> InsertAboveCore(List<string> stored, List<string> order, Dictionary<string, ScenePackage> index)
    {
        var at = stored.IndexOf(PackageResolver.Core) + 1;
        foreach (var name in order)
        {
            foreach (var dependency in DependenciesOf(name, index))
            {
                var found = stored.IndexOf(dependency);
                if (found >= at)
                {
                    at = found + 1;
                }
            }
        }

        return [.. stored.Take(at), .. order, .. stored.Skip(at)];
    }

    static bool MoveIsValid(List<string> stored, string name, MoveDirection direction, Dictionary<string, ScenePackage> index)
    {
        var at = stored.IndexOf(name);
        var other = direction == MoveDirection.Up ? at + 1 : at - 1;
        if (name == PackageResolver.Core || !IsSwappable(stored, at, other))
        {
            return false;
        }

        List<string> next = [.. stored];
        (next[at], next[other]) = (next[other], next[at]);
        return IsOrdered(next, index);
    }

    static bool IsInsideList(List<string> stored, int position) => position >= 0 && position < stored.Count;

    static bool IsSwappable(List<string> stored, int at, int other) =>
        IsInsideList(stored, at) && IsInsideList(stored, other) && stored[other] != PackageResolver.Core;

    static UiProfile WithPackages(UiProfile profile, List<string> packages) =>
        profile with { Packages = profile.Packages.Contains(PackageResolver.Core) ? packages : [.. packages.Where(name => name != PackageResolver.Core)] };

    static PackageEdit Unchanged(UiProfile profile) => new(profile, PackageEditOutcome.Unchanged, [], [], string.Empty);

    static PackageEdit Refused(UiProfile profile, string message) => new(profile, PackageEditOutcome.Refused, [], [], message);

    sealed record RowContext(List<string> Names, List<string> Stored, string? Shell, Dictionary<string, ScenePackage> Index);
}
