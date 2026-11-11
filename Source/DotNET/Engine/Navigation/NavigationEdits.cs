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

    static readonly Dictionary<NavigationEditKind, Func<EditTarget, (NavigationModel Model, string? Rejected)>> _handlers = new()
    {
        [NavigationEditKind.SetOutletMode] = ApplySetOutletMode,
        [NavigationEditKind.SetOutletItems] = ApplySetOutletItems,
        [NavigationEditKind.AddItem] = ApplyAddItem,
        [NavigationEditKind.UpdateItem] = ApplyUpdateItem,
        [NavigationEditKind.MoveItem] = ApplyMoveItem,
        [NavigationEditKind.RemoveItem] = ApplyRemoveItem,
        [NavigationEditKind.HideItem] = ApplyHideItem
    };

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
        if (StartsFromCopy(current, mode, copy))
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
        var refused = RefuseAdd(new(outlet, nested), () => NavigationOutlets.CollectIds(NavigationOutlets.OwnItems(navigation, module, outlet), nested), item, parent);
        if (refused is not null) return new([], refused);

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
        var renamed = Retitled(location.Item, title);
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
        var refused = parent is null ? null : RefuseMoveUnder(new(outlet, nested), parent, own, location.Item);
        if (refused is not null) return new([], refused);

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

        return module is null ? new([], MissingItem(id)) : HideInherited(navigation, module, declared, id);
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

    static OutletItem? Retitled(OutletItem item, string title) => item switch
    {
        OutletNavigationItem navigation => navigation with { Title = title },
        OutletAction action => action with { Title = title },
        OutletGroup group => group with { Title = title },
        _ => RetitledOther(item, title)
    };

    static OutletItem? RetitledOther(OutletItem item, string title) => item switch
    {
        OutletFilter filter => filter with { Title = title },
        OutletTab tab => tab with { Title = title },
        OutletStat stat => stat with { Title = title },
        _ => null
    };

    static bool StartsFromCopy(OutletMode current, OutletMode mode, bool copy) => mode == OutletMode.Overrides && current == OutletMode.Inherits && copy;

    static NavigationEditPlan HideInherited(NavigationModel navigation, string module, Outlet declared, string id)
    {
        var outlet = declared.Name;
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

    static string? RefuseAdd(OutletScope scope, Func<IReadOnlyList<string>> collectIds, OutletItem item, string? parent)
    {
        if (parent is not null && !scope.Nested) return Flat(scope.Outlet);
        var ids = collectIds();
        if (ids.Contains(item.Id)) return DuplicateId(item.Id);
        if (parent is not null && !ids.Contains(parent)) return MissingParent(parent);
        return null;
    }

    static string? RefuseMoveUnder(OutletScope scope, string parent, IReadOnlyList<OutletItem> own, OutletItem moved)
    {
        if (!scope.Nested) return Flat(scope.Outlet);
        if (parent == moved.Id || NavigationOutlets.CollectIds(NavigationOutlets.ChildrenOf(moved), true).Contains(parent)) return IntoItself(moved.Id);
        if (!NavigationOutlets.CollectIds(own, true).Contains(parent)) return MissingParent(parent);
        return null;
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
        if (edit.Kind == NavigationEditKind.SetLogo) return ApplySetLogo(model, edit);
        var (target, rejected) = TargetOf(model, edit);
        return target is null ? (model, rejected) : ApplyToTarget(target);
    }

    static (NavigationModel Model, string? Rejected) ApplySetLogo(NavigationModel model, NavigationEdit edit) =>
        edit.Module is null ? (model with { Application = model.Application with { Logo = edit.Logo } }, null) : (model, LogoLevel);

    static (EditTarget? Target, string? Rejected) TargetOf(NavigationModel model, NavigationEdit edit)
    {
        if (!Enum.IsDefined(edit.Kind)) return (null, $"'{edit.Kind}' is not a navigation edit.");
        if (edit.Outlet is null) return (null, NeedsOutlet);
        var outlet = edit.Outlet;
        var declared = NavigationOutlets.FindApplicationOutlet(model, outlet);
        if (declared is null) return (null, UnknownOutlet(outlet));
        var nested = NavigationOutlets.AllowsSubItems(outlet, declared.Kind);
        return (new EditTarget(model, edit, outlet, declared, nested, NavigationOutlets.OwnItems(model, edit.Module, outlet)), null);
    }

    static (NavigationModel Model, string? Rejected) ApplyToTarget(EditTarget target) =>
        _handlers.TryGetValue(target.Edit.Kind, out var handler) ? handler(target) : (target.Model, $"'{target.Edit.Kind}' is not a navigation edit.");

    static (NavigationModel Model, string? Rejected) ApplySetOutletItems(EditTarget target) =>
        (WithOwnItems(target.Model, target.Edit.Module, target.Declared, _ => target.Edit.Items ?? []), null);

    static (NavigationModel Model, string? Rejected) ApplySetOutletMode(EditTarget target)
    {
        var (model, edit, outlet, _, _, _) = target;
        if (edit.Module is null) return (model, NoMode);
        if (edit.Mode != OutletMode.Inherits)
        {
            return (WithRefinement(model, edit.Module, outlet, refinement => refinement with { Mode = edit.Mode }), null);
        }

        var block = NavigationOutlets.FindModule(model, edit.Module);
        if (block?.Refinements is null) return (model, null);
        var remaining = block.Refinements.Where(refinement => refinement.Outlet != outlet).ToList();
        var updated = block with { Refinements = remaining.Count == 0 ? null : remaining };
        return (model with { Modules = [.. model.Modules.Select(candidate => candidate.Module == edit.Module ? updated : candidate)] }, null);
    }

    static (NavigationModel Model, string? Rejected) ApplyAddItem(EditTarget target)
    {
        var (model, edit, _, declared, nested, own) = target;
        var item = edit.Item!;
        if (!OutletItemKinds.AllowedIn(declared.Kind).Contains(item.Kind)) return (model, KindMismatch(declared, item));
        if (NavigationOutlets.CollectIds(own, nested).Contains(item.Id)) return (model, DuplicateId(item.Id));
        return Place(target, own, item, items => items);
    }

    static (NavigationModel Model, string? Rejected) ApplyUpdateItem(EditTarget target)
    {
        var (model, edit, _, declared, nested, own) = target;
        if (Locate(own, edit.Id ?? string.Empty, nested) is null) return (model, MissingItem(edit.Id ?? string.Empty));
        return (WithOwnItems(model, edit.Module, declared, items => Replace(items, edit.Id!, edit.Item!, nested)), null);
    }

    static (NavigationModel Model, string? Rejected) ApplyMoveItem(EditTarget target)
    {
        var (model, edit, _, _, nested, own) = target;
        var location = Locate(own, edit.Id ?? string.Empty, nested);
        if (location is null) return (model, MissingItem(edit.Id ?? string.Empty));
        var without = Remove(own, location.Item.Id, nested);
        return Place(target, without, location.Item, _ => without);
    }

    static (NavigationModel Model, string? Rejected) ApplyRemoveItem(EditTarget target)
    {
        var (model, edit, _, declared, nested, own) = target;
        if (Locate(own, edit.Id ?? string.Empty, nested) is null) return (model, MissingItem(edit.Id ?? string.Empty));
        return (WithOwnItems(model, edit.Module, declared, items => Remove(items, edit.Id!, nested)), null);
    }

    static (NavigationModel Model, string? Rejected) ApplyHideItem(EditTarget target)
    {
        var (model, edit, outlet, _, _, _) = target;
        if (edit.Module is null) return (model, NoMode);
        return (WithRefinement(model, edit.Module, outlet, refinement => refinement.Hide?.Contains(edit.Id ?? string.Empty) == true
            ? refinement
            : refinement with { Hide = [.. refinement.Hide ?? [], edit.Id ?? string.Empty] }), null);
    }

    static (NavigationModel Model, string? Rejected) Place(EditTarget target, IReadOnlyList<OutletItem> items, OutletItem item, Func<IReadOnlyList<OutletItem>, IReadOnlyList<OutletItem>> baseOf)
    {
        var (model, edit, outlet, declared, nested, _) = target;
        if (edit.Parent is null) return (WithOwnItems(model, edit.Module, declared, listed => Insert(baseOf(listed), item, edit.Index)), null);
        if (!nested || item is not OutletNavigationItem navigationItem) return (model, Flat(outlet));
        if (Locate(items, edit.Parent, nested) is null) return (model, MissingParent(edit.Parent));
        return (WithOwnItems(model, edit.Module, declared, listed => InsertUnder(baseOf(listed), edit.Parent, navigationItem, edit.Index)), null);
    }

    sealed record Location(OutletItem Item, int Index, string? Parent);

    sealed record OutletScope(string Outlet, bool Nested);

    sealed record EditTarget(NavigationModel Model, NavigationEdit Edit, string Outlet, Outlet Declared, bool Nested, IReadOnlyList<OutletItem> Own);
}
