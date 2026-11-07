// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// The diagnostics the outlet engine raises, with the messages both engines share.
/// </summary>
public static class OutletProblems
{
    /// <summary>No level declares the outlet.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic UnknownOutlet(string outlet) =>
        new(OutletDiagnosticCode.UnknownOutlet, OutletDiagnosticSeverity.Error, outlet, $"No level declares the outlet '{outlet}'");

    /// <summary>A level declares an outlet a level above it already declares.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level that declares it again.</param>
    /// <param name="declaredBy">The level that declared it first.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic DuplicateOutlet(string outlet, string owner, string declaredBy) =>
        new(OutletDiagnosticCode.DuplicateOutlet, OutletDiagnosticSeverity.Error, outlet, $"{owner} declares the outlet '{outlet}', which {declaredBy} already declares", owner);

    /// <summary>A level refines an outlet no level above it declares.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic RefinementOfUnknownOutlet(string outlet, string owner) =>
        new(OutletDiagnosticCode.RefinementOfUnknownOutlet, OutletDiagnosticSeverity.Error, outlet, $"{owner} refines the outlet '{outlet}', which no level above it declares", owner);

    /// <summary>A level contributes to an outlet no level declares.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic ContributionToUnknownOutlet(string outlet, string owner) =>
        new(OutletDiagnosticCode.ContributionToUnknownOutlet, OutletDiagnosticSeverity.Error, outlet, $"{owner} contributes to the outlet '{outlet}', which no level declares", owner);

    /// <summary>A level hides an item the outlet neither inherits nor receives as a contribution.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <param name="item">The hidden id.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic HiddenItemMissing(string outlet, string owner, string item) =>
        new(OutletDiagnosticCode.HiddenItemMissing, OutletDiagnosticSeverity.Warning, outlet, $"{owner} hides '{item}', which the outlet '{outlet}' neither inherits nor receives as a contribution", owner, item);

    /// <summary>An item goes before or after an item the outlet does not have.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <param name="item">The placed item.</param>
    /// <param name="placement"><c language="screenplay">before</c> or <c language="screenplay">after</c>.</param>
    /// <param name="target">The id it is placed relative to.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic PlacementTargetMissing(string outlet, string owner, string item, string placement, string target) =>
        new(OutletDiagnosticCode.PlacementTargetMissing, OutletDiagnosticSeverity.Warning, outlet, $"{owner} places '{item}' {placement} '{target}', which the outlet '{outlet}' does not have, so it goes last", owner, item);

    /// <summary>A level places an item before one that comes from above it; it goes first after those instead.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <param name="item">The placed item.</param>
    /// <param name="target">The id it is placed before.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic PlacementAboveInherited(string outlet, string owner, string item, string target) =>
        new(OutletDiagnosticCode.PlacementAboveInherited, OutletDiagnosticSeverity.Warning, outlet, $"{owner} places '{item}' before '{target}' in the outlet '{outlet}', but own items never go above inherited ones and contributions never above either, so it goes first after them", owner, item);

    /// <summary>An item is of a kind the outlet does not take.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="kind">The outlet kind.</param>
    /// <param name="owner">The level.</param>
    /// <param name="item">The item.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic ItemKindMismatch(string outlet, OutletKind kind, string owner, OutletItem item) =>
        new(
            OutletDiagnosticCode.ItemKindMismatch,
            OutletDiagnosticSeverity.Error,
            outlet,
            $"{owner} puts the {OutletItemKinds.NameOf(item.Kind)} '{item.Id}' in the {OutletItemKinds.NameOf(kind)} outlet '{outlet}', which takes {OutletItemKinds.Describe(kind)}",
            owner,
            item.Id);

    /// <summary>A group holds an item that is not a button, menu entry or separator.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <param name="group">The id of the group.</param>
    /// <param name="item">The item.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic GroupItemKindMismatch(string outlet, string owner, string group, OutletItem item) =>
        new(
            OutletDiagnosticCode.ItemKindMismatch,
            OutletDiagnosticSeverity.Error,
            outlet,
            $"{owner} puts the {OutletItemKinds.NameOf(item.Kind)} '{item.Id}' in the group '{group}' of the outlet '{outlet}', which takes buttons, menu entries and separators",
            owner,
            item.Id);

    /// <summary>An item has the id of an item the outlet already has.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <param name="item">The id.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic DuplicateItemId(string outlet, string owner, string item) =>
        new(OutletDiagnosticCode.DuplicateItemId, OutletDiagnosticSeverity.Error, outlet, $"{owner} adds '{item}' to the outlet '{outlet}', which already has an item with that id", owner, item);

    /// <summary>A level inherits an outlet unchanged but has items or hides.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The level.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic ItemsIgnoredWhenInheriting(string outlet, string owner) =>
        new(OutletDiagnosticCode.ItemsIgnoredWhenInheriting, OutletDiagnosticSeverity.Warning, outlet, $"{owner} inherits the outlet '{outlet}' unchanged, so its items and hides are ignored; extend or override it to use them", owner);

    /// <summary>An outlet of tabs names no slot.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="owner">The declaring level.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic TabsNeedSlot(string outlet, string owner) =>
        new(OutletDiagnosticCode.TabsNeedSlot, OutletDiagnosticSeverity.Error, outlet, $"The tabs outlet '{outlet}' of {owner} names no slot to show its screens in", owner);

    /// <summary>An outlet that is not of actions names a subject.</summary>
    /// <param name="outlet">The outlet name.</param>
    /// <param name="kind">The outlet kind.</param>
    /// <param name="owner">The declaring level.</param>
    /// <returns>The diagnostic.</returns>
    public static OutletDiagnostic SubjectOnlyForActions(string outlet, OutletKind kind, string owner) =>
        new(OutletDiagnosticCode.SubjectOnlyForActions, OutletDiagnosticSeverity.Warning, outlet, $"The {OutletItemKinds.NameOf(kind)} outlet '{outlet}' of {owner} names a subject; only an outlet of actions has one", owner);
}
