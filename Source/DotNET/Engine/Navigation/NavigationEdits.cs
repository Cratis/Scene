// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Plans and applies the changes a user makes to navigation outlets: switching how a module treats an outlet, and adding,
/// renaming, moving, duplicating and removing items and sub-items. Going back to inherits drops the module's refinement; going
/// from inherits to overrides with a copy starts from the application's items; adding to an outlet a module inherits switches it
/// to extends first; removing an item a module inherits hides it; the logo is defined at the application level only.
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">switchOutletMode</c>, <c language="csharp">addNavigationItem</c>, <c language="csharp">renameNavigationItem</c>,
/// <c language="csharp">moveNavigationItem</c>, <c language="csharp">duplicateNavigationItem</c>, <c language="csharp">removeNavigationItem</c>,
/// <c language="csharp">setApplicationLogo</c> and <c language="csharp">applyNavigationEdits</c>) makes the same plans and results; both are asserted
/// against <c language="csharp">navigation-inheritance-fixtures.json</c>.
/// </remarks>
public static class NavigationEdits
{
    const string NoMode = "The application is the base of the navigation and has no outlet mode.";
    const string LogoLevel = "The logo is defined at the application level only.";
    const string NeedsOutlet = "A navigation edit names the outlet it changes.";

    /// <summary>
    /// Plans switching how a module treats an outlet it inherits.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module; <see langword="null"/> for the application, which is refused since it has no mode.</param>
    /// <param name="outlet">The outlet, such as <c language="csharp">sidebar</c>.</param>
    /// <param name="mode">The mode to switch to.</param>
    /// <param name="copy">Whether to copy the application's items when switching from inherits to overrides.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan SwitchOutletMode(NavigationModel navigation, string? module, string outlet, OutletMode mode, bool copy = false)
    {
        if (module is null) return new([], NoMode);
        var declared = NavigationOutlets.FindApplicationOutlet(navigation, outlet);
        if (declared is null) return new([], UnknownOutlet(outlet));
        var current = NavigationOutlets.ModeOf(navigation, module, outlet);
        if (current == mode) return new([]);
        var setMode = new NavigationEdit(NavigationEditKind.SetOutletMode, module, outlet, mode);
        if (mode == OutletMode.Overrides && current == OutletMode.Inherits && copy)
        {
            return new([new NavigationEdit(NavigationEditKind.SetOutletItems, module, outlet, Items: declared.Defaults), setMode]);
        }

        return new([setMode]);
    }

    /// <summary>
    /// Plans adding an item - or a sub-item of one of the level's own items - to an outlet.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The outlet, such as <c language="csharp">sidebar</c> or <c language="csharp">topbarButtons</c>.</param>
    /// <param name="item">The item to add.</param>
    /// <param name="parent">The id of the item it becomes a sub-item of; <see langword="null"/> for a top-level item.</param>
    /// <param name="index">The position among its siblings; after the ones already there when <see langword="null"/>.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan AddItem(NavigationModel navigation, string? module, string outlet, OutletItem item, string? parent = null, int? index = null)
    {
        var declared = NavigationOutlets.FindApplicationOutlet(navigation, outlet);
        if (declared is null) return new([], UnknownOutlet(outlet));
        if (!OutletItemKinds.AllowedIn(declared.Kind).Contains(item.Kind)) return new([], KindMismatch(declared, item));
        var nested = NavigationOutlets.AllowsSubItems(outlet, declared.Kind);
        if (parent is not null && !nested) return new([], Flat(outlet));
        var ids = NavigationOutlets.CollectIds(NavigationOutlets.OwnItems(navigation, module, outlet), nested);
        if (ids.Contains(item.Id)) return new([], DuplicateId(item.Id));
        if (parent is not null && !ids.Contains(parent)) return new([], MissingParent(parent));

        var add = new NavigationEdit(NavigationEditKind.AddItem, module, outlet, Parent: parent, Index: index, Item: item);
        if (module is not null && NavigationOutlets.ModeOf(navigation, module, outlet) == OutletMode.Inherits)
        {
            return new([new NavigationEdit(NavigationEditKind.SetOutletMode, module, outlet, OutletMode.Extends), add]);
        }

        return new([add]);
    }

    /// <summary>
    /// Plans renaming one of the items a level puts in an outlet itself. An item the module inherits is renamed where it is defined.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The outlet.</param>
    /// <param name="id">The id of the item.</param>
    /// <param name="title">The new title.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan RenameItem(NavigationModel navigation, string? module, string outlet, string id, string title)
    {
        var declared = NavigationOutlets.FindApplicationOutlet(navigation, outlet);
        if (declared is null) return new([], UnknownOutlet(outlet));
        var location = Locate(NavigationOutlets.OwnItems(navigation, module, outlet), id, NavigationOutlets.AllowsSubItems(outlet, declared.Kind));
        if (location is null) return new([], MissingOrInherited(navigation, module, declared, id));
        OutletItem? renamed = location.Item switch
        {
            OutletNavigationItem item => item with { Title = title },
            OutletAction item => item with { Title = title },
            OutletGroup item => item with { Title = title },
            OutletFilter item => item with { Title = title },
            OutletTab item => item with { Title = title },
            OutletStat item => item with { Title = title },
            _ => null
        };
        return renamed is null ? new([], NoTitle(id)) : new([new NavigationEdit(NavigationEditKind.UpdateItem, module, outlet, Id: id, Item: renamed)]);
    }

    /// <summary>
    /// Plans moving one of the items a level puts in an outlet itself: to another position among its siblings, or under another of
    /// the level's items.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The outlet.</param>
    /// <param name="id">The id of the item.</param>
    /// <param name="parent">The id of its new parent; <see langword="null"/> for the top level.</param>
    /// <param name="index">Its position among its new siblings; the end when <see langword="null"/>.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan MoveItem(NavigationModel navigation, string? module, string outlet, string id, string? parent = null, int? index = null)
    {
        var declared = NavigationOutlets.FindApplicationOutlet(navigation, outlet);
        if (declared is null) return new([], UnknownOutlet(outlet));
        var nested = NavigationOutlets.AllowsSubItems(outlet, declared.Kind);
        var own = NavigationOutlets.OwnItems(navigation, module, outlet);
        var location = Locate(own, id, nested);
        if (location is null) return new([], MissingOrInherited(navigation, module, declared, id));
        if (parent is not null)
        {
            if (!nested) return new([], Flat(outlet));
            if (parent == id || NavigationOutlets.CollectIds(NavigationOutlets.ChildrenOf(location.Item), true).Contains(parent)) return new([], IntoItself(id));
            if (!NavigationOutlets.CollectIds(own, true).Contains(parent)) return new([], MissingParent(parent));
        }

        return new([new NavigationEdit(NavigationEditKind.MoveItem, module, outlet, Id: id, Parent: parent, Index: index)]);
    }

    /// <summary>
    /// Plans duplicating one of the items a level puts in an outlet itself. The copy goes right after the item and gets fresh ids -
    /// <c language="csharp">&lt;id&gt;-copy</c>, numbered when that is taken - for itself and every sub-item.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The outlet.</param>
    /// <param name="id">The id of the item.</param>
    /// <param name="newId">The id of the copy; a fresh one when <see langword="null"/>.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan DuplicateItem(NavigationModel navigation, string? module, string outlet, string id, string? newId = null)
    {
        var declared = NavigationOutlets.FindApplicationOutlet(navigation, outlet);
        if (declared is null) return new([], UnknownOutlet(outlet));
        var own = NavigationOutlets.OwnItems(navigation, module, outlet);
        var location = Locate(own, id, NavigationOutlets.AllowsSubItems(outlet, declared.Kind));
        if (location is null) return new([], MissingOrInherited(navigation, module, declared, id));
        var used = NavigationOutlets.CollectIds(own, true).ToHashSet(StringComparer.Ordinal);
        if (newId is not null && used.Contains(newId)) return new([], DuplicateId(newId));

        var copy = CopyWithFreshIds(location.Item, used, newId) with { Before = null, After = null };
        return new([new NavigationEdit(NavigationEditKind.AddItem, module, outlet, Parent: location.Parent, Index: location.Index + 1, Item: copy)]);
    }

    /// <summary>
    /// Plans removing an item. One of the level's own items is removed with its sub-items; an item a module inherits from the
    /// application is hidden instead - switching the module to extends first when it inherits the outlet.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="outlet">The outlet.</param>
    /// <param name="id">The id of the item.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan RemoveItem(NavigationModel navigation, string? module, string outlet, string id)
    {
        var declared = NavigationOutlets.FindApplicationOutlet(navigation, outlet);
        if (declared is null) return new([], UnknownOutlet(outlet));
        if (Locate(NavigationOutlets.OwnItems(navigation, module, outlet), id, NavigationOutlets.AllowsSubItems(outlet, declared.Kind)) is not null)
        {
            return new([new NavigationEdit(NavigationEditKind.RemoveItem, module, outlet, Id: id)]);
        }

        if (module is null) return new([], MissingItem(id));
        var mode = NavigationOutlets.ModeOf(navigation, module, outlet);
        if (mode == OutletMode.Overrides || !declared.Defaults.Any(item => item.Id == id))
        {
            return new([], MissingOrInherited(navigation, module, declared, id));
        }

        var hide = new NavigationEdit(NavigationEditKind.HideItem, module, outlet, Id: id);
        return mode == OutletMode.Inherits
            ? new([new NavigationEdit(NavigationEditKind.SetOutletMode, module, outlet, OutletMode.Extends), hide])
            : new([hide]);
    }

    /// <summary>
    /// Plans setting the application logo; it is defined at the application level only.
    /// </summary>
    /// <param name="module">The module; <see langword="null"/> for the application.</param>
    /// <param name="logo">The logo.</param>
    /// <returns>The plan.</returns>
    public static NavigationEditPlan SetApplicationLogo(string? module, ApplicationLogo logo) =>
        module is null ? new([new NavigationEdit(NavigationEditKind.SetLogo, Logo: logo)]) : new([], LogoLevel);

    /// <summary>
    /// Applies navigation edits to the model. Either every edit applies, or none does.
    /// </summary>
    /// <param name="navigation">The navigation as it is.</param>
    /// <param name="edits">The edits, in order.</param>
    /// <returns>The outcome.</returns>
    public static NavigationEditOutcome Apply(NavigationModel navigation, IReadOnlyList<NavigationEdit> edits)
    {
        var model = navigation;
        foreach (var edit in edits)
        {
            var (next, rejected) = ApplyOne(model, edit);
            if (rejected is not null)
            {
                return new(false, navigation, rejected);
            }

            model = next;
        }

        return new(true, model);
    }

    static string UnknownOutlet(string outlet) => $"There is no outlet '{outlet}' to edit.";

    static string Flat(string outlet) => $"The {outlet} is flat; its items have no sub-items.";

    static string KindMismatch(Outlet outlet, OutletItem item) =>
        $"The outlet '{outlet.Name}' lists {OutletItemKinds.NameOf(outlet.Kind)} and does not take a {JsonNamingPolicy.CamelCase.ConvertName(item.Kind.ToString())} item.";

    static string DuplicateId(string id) => $"Item id '{id}' is already used in this outlet.";

    static string MissingParent(string parent) => $"There is no item '{parent}' to add a sub-item to.";

    static string MissingItem(string id) => $"There is no item '{id}' in this outlet.";

    static string InheritedItem(string id) => $"Item '{id}' is inherited from the application; edit it there.";

    static string IntoItself(string id) => $"Item '{id}' cannot become a sub-item of itself.";

    static string NoTitle(string id) => $"Item '{id}' has no title to rename.";

    static string MissingOrInherited(NavigationModel navigation, string? module, Outlet declared, string id)
    {
        if (module is null || NavigationOutlets.ModeOf(navigation, module, declared.Name) == OutletMode.Overrides) return MissingItem(id);
        return Locate(declared.Defaults, id, true) is not null ? InheritedItem(id) : MissingItem(id);
    }

    static Location? Locate(IReadOnlyList<OutletItem> items, string id, bool nested, string? parent = null)
    {
        for (var index = 0; index < items.Count; index++)
        {
            var item = items[index];
            if (item.Id == id) return new(item, index, parent);
            if (!nested) continue;
            var found = Locate(NavigationOutlets.ChildrenOf(item), id, nested, item.Id);
            if (found is not null) return found;
        }

        return null;
    }

    static string FreshId(string id, HashSet<string> used)
    {
        var candidate = id;
        for (var number = 2; used.Contains(candidate); number++)
        {
            candidate = $"{id}-{number}";
        }

        used.Add(candidate);
        return candidate;
    }

    static OutletItem CopyWithFreshIds(OutletItem item, HashSet<string> used, string? id = null)
    {
        var copyId = id ?? FreshId($"{item.Id}-copy", used);
        if (id is not null) used.Add(id);
        return item is OutletNavigationItem { Children: { } children } navigation
            ? navigation with { Id = copyId, Children = [.. children.Select(child => (OutletNavigationItem)CopyWithFreshIds(child, used))] }
            : item with { Id = copyId };
    }

    static List<OutletItem> Insert(IReadOnlyList<OutletItem> siblings, OutletItem item, int? index)
    {
        var list = siblings.ToList();
        var at = index is null ? list.Count : Math.Clamp(index.Value, 0, list.Count);
        list.Insert(at, item);
        return list;
    }

    static IReadOnlyList<OutletItem> Remove(IReadOnlyList<OutletItem> items, string id, bool nested) =>
        [.. items
            .Where(item => item.Id != id)
            .Select(item => nested && item is OutletNavigationItem { Children: { } children } navigation
                ? navigation with { Children = [.. Remove(children, id, nested).Cast<OutletNavigationItem>()] }
                : item)];

    static IReadOnlyList<OutletItem> Replace(IReadOnlyList<OutletItem> items, string id, OutletItem replacement, bool nested) =>
        [.. items.Select(item =>
        {
            if (item.Id == id) return replacement;
            return nested && item is OutletNavigationItem { Children: { } children } navigation
                ? navigation with { Children = [.. Replace(children, id, replacement, nested).Cast<OutletNavigationItem>()] }
                : item;
        })];

    static IReadOnlyList<OutletItem> InsertUnder(IReadOnlyList<OutletItem> items, string parent, OutletNavigationItem item, int? index) =>
        [.. items.Select(candidate =>
        {
            if (candidate is not OutletNavigationItem navigation) return candidate;
            if (candidate.Id == parent) return navigation with { Children = [.. Insert(navigation.Children ?? [], item, index).Cast<OutletNavigationItem>()] };
            return navigation.Children is { } children
                ? navigation with { Children = [.. InsertUnder(children, parent, item, index).Cast<OutletNavigationItem>()] }
                : navigation;
        })];

    static NavigationModel WithApplicationOutlet(NavigationModel model, Outlet outlet, Func<Outlet, Outlet> change)
    {
        var declared = model.Application.Outlets ?? [];
        var outlets = declared.Any(candidate => candidate.Name == outlet.Name)
            ? declared.Select(candidate => candidate.Name == outlet.Name ? change(candidate) : candidate)
            : declared.Append(change(outlet));
        return model with { Application = model.Application with { Outlets = [.. outlets] } };
    }

    static NavigationModel WithRefinement(NavigationModel model, string module, string outlet, Func<OutletRefinement, OutletRefinement> change)
    {
        var block = NavigationOutlets.FindModule(model, module) ?? new ModuleNavigation(module);
        var refinements = block.Refinements ?? [];
        var changed = refinements.Any(refinement => refinement.Outlet == outlet)
            ? refinements.Select(refinement => refinement.Outlet == outlet ? change(refinement) : refinement)
            : refinements.Append(change(new OutletRefinement(outlet)));
        var updated = block with { Refinements = [.. changed] };
        var modules = model.Modules.Any(candidate => candidate.Module == module)
            ? model.Modules.Select(candidate => candidate.Module == module ? updated : candidate)
            : model.Modules.Append(updated);
        return model with { Modules = [.. modules] };
    }

    static NavigationModel WithOwnItems(NavigationModel model, string? module, Outlet declared, Func<IReadOnlyList<OutletItem>, IReadOnlyList<OutletItem>> change) =>
        module is null
            ? WithApplicationOutlet(model, declared, outlet => outlet with { Defaults = change(outlet.Defaults) })
            : WithRefinement(model, module, declared.Name, refinement => refinement with { Items = change(refinement.Items ?? []) });

    static (NavigationModel Model, string? Rejected) ApplyOne(NavigationModel model, NavigationEdit edit)
    {
        if (edit.Kind == NavigationEditKind.SetLogo)
        {
            return edit.Module is null ? (model with { Application = model.Application with { Logo = edit.Logo } }, null) : (model, LogoLevel);
        }

        if (!Enum.IsDefined(edit.Kind)) return (model, $"'{edit.Kind}' is not a navigation edit.");
        if (edit.Outlet is null) return (model, NeedsOutlet);
        var outlet = edit.Outlet;
        var declared = NavigationOutlets.FindApplicationOutlet(model, outlet);
        if (declared is null) return (model, UnknownOutlet(outlet));
        var nested = NavigationOutlets.AllowsSubItems(outlet, declared.Kind);
        var own = NavigationOutlets.OwnItems(model, edit.Module, outlet);

        switch (edit.Kind)
        {
            case NavigationEditKind.SetOutletMode:
                if (edit.Module is null) return (model, NoMode);
                if (edit.Mode == OutletMode.Inherits)
                {
                    var block = NavigationOutlets.FindModule(model, edit.Module);
                    if (block?.Refinements is null) return (model, null);
                    var remaining = block.Refinements.Where(refinement => refinement.Outlet != outlet).ToList();
                    var updated = block with { Refinements = remaining.Count == 0 ? null : remaining };
                    return (model with { Modules = [.. model.Modules.Select(candidate => candidate.Module == edit.Module ? updated : candidate)] }, null);
                }

                return (WithRefinement(model, edit.Module, outlet, refinement => refinement with { Mode = edit.Mode }), null);

            case NavigationEditKind.SetOutletItems:
                return (WithOwnItems(model, edit.Module, declared, _ => edit.Items ?? []), null);

            case NavigationEditKind.AddItem:
            {
                var item = edit.Item!;
                if (!OutletItemKinds.AllowedIn(declared.Kind).Contains(item.Kind)) return (model, KindMismatch(declared, item));
                if (NavigationOutlets.CollectIds(own, nested).Contains(item.Id)) return (model, DuplicateId(item.Id));
                if (edit.Parent is null) return (WithOwnItems(model, edit.Module, declared, items => Insert(items, item, edit.Index)), null);
                if (!nested || item is not OutletNavigationItem navigationItem) return (model, Flat(outlet));
                if (Locate(own, edit.Parent, nested) is null) return (model, MissingParent(edit.Parent));
                return (WithOwnItems(model, edit.Module, declared, items => InsertUnder(items, edit.Parent, navigationItem, edit.Index)), null);
            }

            case NavigationEditKind.UpdateItem:
                if (Locate(own, edit.Id ?? string.Empty, nested) is null) return (model, MissingItem(edit.Id ?? string.Empty));
                return (WithOwnItems(model, edit.Module, declared, items => Replace(items, edit.Id!, edit.Item!, nested)), null);

            case NavigationEditKind.MoveItem:
            {
                var location = Locate(own, edit.Id ?? string.Empty, nested);
                if (location is null) return (model, MissingItem(edit.Id ?? string.Empty));
                var without = Remove(own, location.Item.Id, nested);
                if (edit.Parent is null) return (WithOwnItems(model, edit.Module, declared, _ => Insert(without, location.Item, edit.Index)), null);
                if (!nested || location.Item is not OutletNavigationItem moved) return (model, Flat(outlet));
                if (Locate(without, edit.Parent, nested) is null) return (model, MissingParent(edit.Parent));
                return (WithOwnItems(model, edit.Module, declared, _ => InsertUnder(without, edit.Parent, moved, edit.Index)), null);
            }

            case NavigationEditKind.RemoveItem:
                if (Locate(own, edit.Id ?? string.Empty, nested) is null) return (model, MissingItem(edit.Id ?? string.Empty));
                return (WithOwnItems(model, edit.Module, declared, items => Remove(items, edit.Id!, nested)), null);

            case NavigationEditKind.HideItem:
                if (edit.Module is null) return (model, NoMode);
                return (WithRefinement(model, edit.Module, outlet, refinement => refinement.Hide?.Contains(edit.Id ?? string.Empty) == true
                    ? refinement
                    : refinement with { Hide = [.. refinement.Hide ?? [], edit.Id ?? string.Empty] }), null);

            default:
                return (model, $"'{edit.Kind}' is not a navigation edit.");
        }
    }

    sealed record Location(OutletItem Item, int Index, string? Parent);
}
