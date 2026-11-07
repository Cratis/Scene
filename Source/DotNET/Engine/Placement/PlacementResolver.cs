// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;
using Cratis.Scene.Engine.Slots;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Works out where an action's slice opens, and why. The TypeScript twin is <c language="csharp">resolvePlacement</c> in
/// <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared <c language="csharp">placement-fixtures.json</c>.
/// </summary>
/// <remarks>
/// <list type="bullet">
/// <item><description>The page always has a dialog and a drawer; they sit over it and are never routed. A page, a pane and a panel are
/// slots of the page, matched by role. A slot is free unless the page's own content fills it; a routed slot is always free,
/// because opening something there replaces what it shows.</description></item>
/// <item><description>Automatic takes the screen's first fit the page has free. A slice with no screen runs directly when every input
/// has a source, and cannot be placed otherwise.</description></item>
/// <item><description>Run directly needs a source for every input.</description></item>
/// <item><description>A dialog or a drawer must be one of the screen's fits.</description></item>
/// <item><description>A slot must be named, declared by the page, of a role the screen fits, and free.</description></item>
/// <item><description>A routed slot reports what opening the slice there adds to the route - the slot's route parameters with the page's
/// values, then the slice's name in kebab case - as parts, not a path: a renderer builds the URL (ADR-004).</description></item>
/// </list>
/// </remarks>
public static partial class PlacementResolver
{
    static readonly string[] _ordinals = ["first", "second", "third", "fourth", "fifth"];

    /// <summary>
    /// Works out where an action's slice opens, and why.
    /// </summary>
    /// <param name="request">What the action asks for, what the slice fits, and the page's slots.</param>
    /// <returns>The decision, with the reason, whether the slice could run directly, and every slot as a choice.</returns>
    public static PlacementDecision Resolve(PlacementRequest request)
    {
        var requested = request.Opens ?? Opens.Automatic;
        var fits = EffectiveFits(request.Fits);
        var runDirectly = RunDirectlyOf(request);
        var slots = SlotOptionsOf(request, fits);
        var outcome = requested switch
        {
            Opens.None => Runs(runDirectly),
            Opens.Dialog => OverPage(request, fits, ScreenFit.Dialog, Opens.Dialog),
            Opens.Drawer => OverPage(request, fits, ScreenFit.Drawer, Opens.Drawer),
            Opens.Slot => ExplicitSlot(request, fits),
            _ => Automatic(request, fits, runDirectly),
        };

        return new(requested, outcome.Routed, outcome.Reason, runDirectly, slots, outcome.Resolved, outcome.Fit, outcome.Slot, outcome.Route, outcome.Problem);
    }

    /// <summary>
    /// The places a screen fits, in order, with repeats left out. A screen that lists none fits a dialog, where a command's
    /// form opened before screens listed what they fit.
    /// </summary>
    /// <param name="fits">The fits the screen lists.</param>
    /// <returns>The effective fits.</returns>
    public static IReadOnlyList<ScreenFit> EffectiveFits(IEnumerable<ScreenFit>? fits)
    {
        var declared = (fits ?? []).Distinct().ToList();
        return declared.Count == 0 ? [ScreenFit.Dialog] : declared;
    }

    /// <summary>
    /// Turns a slice id into the route segment it opens as: the last part of the id in kebab case, so
    /// <c language="csharp">Catalog.Products.SetProductPrice</c> becomes <c language="csharp">set-product-price</c>.
    /// </summary>
    /// <param name="slice">The qualified id of the slice.</param>
    /// <returns>The segment.</returns>
    public static string SliceRouteSegment(string slice)
    {
        var name = slice[(slice.LastIndexOf('.') + 1)..];
        var kebab = AcronymBoundary().Replace(WordBoundary().Replace(name, "${a}-${b}"), "${a}-${b}");
        return new string([.. kebab.Select(char.ToLowerInvariant)]);
    }

    /// <summary>
    /// The slots of a layout or screen template as placement sees them: each with its resolved role, routing, and whether the
    /// page's own content fills it.
    /// </summary>
    /// <param name="slots">The slots the page declares.</param>
    /// <param name="filled">The names of the slots the page's own content fills.</param>
    /// <returns>The slots for <see cref="Resolve"/>.</returns>
    public static IReadOnlyList<PlacementSlot> SlotsOf(IEnumerable<Slot> slots, IEnumerable<string> filled)
    {
        var full = filled.ToHashSet(StringComparer.Ordinal);
        return [.. slots.Select(slot => new PlacementSlot(slot.Name, SlotRoles.Resolve(slot), full.Contains(slot.Name), slot.Routed == true, slot.RoutedBy ?? []))];
    }

    static string NameOf(SlotRole role) => role switch
    {
        SlotRole.Page => "page",
        SlotRole.Panel => "panel",
        _ => "pane",
    };

    static string NameOf(ScreenFit fit) => fit switch
    {
        ScreenFit.Dialog => "dialog",
        ScreenFit.Drawer => "drawer",
        ScreenFit.Panel => "panel",
        ScreenFit.Page => "page",
        _ => "pane",
    };

    static string Label(ScreenFit fit)
    {
        var name = NameOf(fit);
        return char.ToUpperInvariant(name[0]) + name[1..];
    }

    static ScreenFit FitOf(SlotRole role) => role switch
    {
        SlotRole.Page => ScreenFit.Page,
        SlotRole.Panel => ScreenFit.Panel,
        _ => ScreenFit.Pane,
    };

    static string List(IReadOnlyList<string> words, string conjunction) =>
        words.Count <= 1 ? string.Concat(words) : $"{string.Join(", ", words.Take(words.Count - 1))} {conjunction} {words[^1]}";

    static bool IsFree(PlacementSlot slot) => slot.Routed == true || slot.Filled != true;

    static PlacementRoute RouteOf(PlacementSlot slot, PlacementRequest request)
    {
        var parameters = (slot.RoutedBy ?? []).Select(name => new PlacementRouteParameter(name, request.RouteValues is not null && request.RouteValues.TryGetValue(name, out var value) ? value : null));
        return new(slot.Name, [.. parameters], SliceRouteSegment(request.Slice));
    }

    static string MissingPhrase(IReadOnlyList<string> missing) => $"{List(missing, "and")} {(missing.Count == 1 ? "has" : "have")} no source";

    static RunDirectly RunDirectlyOf(PlacementRequest request)
    {
        var missing = request.Inputs.Where(input => input.Source is null).Select(input => input.Name).ToList();
        if (missing.Count == 0)
        {
            return new(true, missing, "Every input has a source");
        }

        return new(false, missing, $"{MissingPhrase(missing)}, so {(missing.Count == 1 ? "it needs" : "they need")} the form");
    }

    static List<SlotOption> SlotOptionsOf(PlacementRequest request, IReadOnlyList<ScreenFit> fits) =>
        [.. request.Slots.Select(slot =>
        {
            var role = NameOf(slot.Role);
            var routed = slot.Routed == true;
            if (request.Screen is null)
            {
                return new SlotOption(slot.Name, slot.Role, routed, false, "Not offered: the slice has no screen");
            }

            if (!fits.Contains(FitOf(slot.Role)))
            {
                return new SlotOption(slot.Name, slot.Role, routed, false, $"Not offered: the slice doesn't list {role} in what it fits");
            }

            if (!IsFree(slot))
            {
                return new SlotOption(slot.Name, slot.Role, routed, false, "Not offered: it is already filled");
            }

            if (!routed)
            {
                return new SlotOption(slot.Name, slot.Role, routed, true, $"{role}: free");
            }

            return new SlotOption(slot.Name, slot.Role, routed, true, $"{role}, routed: opening here changes the URL", RouteOf(slot, request));
        })];

    static Outcome InSlot(PlacementSlot slot, PlacementRequest request, string reason)
    {
        var routed = slot.Routed == true;
        var route = routed ? RouteOf(slot, request) : null;
        return new(routed, route is null ? reason : $"{reason}; it is routed, so opening it changes the URL", Opens.Slot, FitOf(slot.Role), slot.Name, route);
    }

    static Outcome CannotPlace(PlacementProblem problem, string reason) => new(false, reason, Problem: problem);

    static Outcome Automatic(PlacementRequest request, IReadOnlyList<ScreenFit> fits, RunDirectly runDirectly)
    {
        if (request.Screen is null)
        {
            return runDirectly.Available
                ? new(false, "Runs directly: the slice has no screen", Opens.None)
                : CannotPlace(PlacementProblem.InputsWithoutSource, $"The slice has no screen, so it can only run directly, but {MissingPhrase(runDirectly.Missing)}");
        }

        var listsNoFits = request.Fits is null || request.Fits.Count == 0;
        var skipped = new List<string>();
        for (var index = 0; index < fits.Count; index++)
        {
            var fit = fits[index];
            if (fit is ScreenFit.Dialog or ScreenFit.Drawer)
            {
                var reason = listsNoFits ? $"{Label(fit)}: the screen lists no fits, so it opens in a dialog" : ReasonFor(fit, index, skipped);
                return new(false, reason, fit == ScreenFit.Dialog ? Opens.Dialog : Opens.Drawer, fit);
            }

            var slot = request.Slots.FirstOrDefault(candidate => FitOf(candidate.Role) == fit && IsFree(candidate));
            if (slot is null)
            {
                if (!skipped.Contains(NameOf(fit)))
                {
                    skipped.Add(NameOf(fit));
                }

                continue;
            }

            var chosen = index == 0
                ? $"{Label(fit)}: the slice's first fit, and the page has room in '{slot.Name}'"
                : $"{ReasonFor(fit, index, skipped)}; it opens in '{slot.Name}'";
            return InSlot(slot, request, chosen);
        }

        return CannotPlace(PlacementProblem.NothingFits, $"Nothing: the page has no free {List([.. fits.Select(NameOf)], "or")} for the slice");
    }

    static string ReasonFor(ScreenFit fit, int index, IReadOnlyList<string> skipped)
    {
        var ordinal = index < _ordinals.Length ? _ordinals[index] : $"{index + 1}th";
        return index == 0
            ? $"{Label(fit)}: the slice's first fit, and the page has room"
            : $"{Label(fit)}: the slice's {ordinal} fit, since the page has no free {List(skipped, "or")}";
    }

    static Outcome OverPage(PlacementRequest request, IReadOnlyList<ScreenFit> fits, ScreenFit fit, Opens opens)
    {
        if (request.Screen is null)
        {
            return CannotPlace(PlacementProblem.NoScreen, "The slice has no screen, so it can only run directly");
        }

        return fits.Contains(fit)
            ? new(false, $"{Label(fit)}: chosen on the trigger", opens, fit)
            : CannotPlace(PlacementProblem.NotFitted, $"The slice doesn't list {NameOf(fit)} in what it fits");
    }

    static Outcome ExplicitSlot(PlacementRequest request, IReadOnlyList<ScreenFit> fits)
    {
        var name = request.OpensIn;
        if (string.IsNullOrEmpty(name))
        {
            return CannotPlace(PlacementProblem.SlotNotNamed, "It opens in a slot, but names none");
        }

        if (request.Screen is null)
        {
            return CannotPlace(PlacementProblem.NoScreen, "The slice has no screen, so it can only run directly");
        }

        var slot = request.Slots.FirstOrDefault(candidate => candidate.Name == name);
        if (slot is null)
        {
            return CannotPlace(PlacementProblem.SlotNotDeclared, $"The page has no slot named '{name}'");
        }

        if (!fits.Contains(FitOf(slot.Role)))
        {
            return CannotPlace(PlacementProblem.RoleNotFitted, $"The slice doesn't list {NameOf(slot.Role)} in what it fits, so it cannot open in '{name}'");
        }

        return IsFree(slot)
            ? InSlot(slot, request, $"In '{name}': chosen on the trigger")
            : CannotPlace(PlacementProblem.SlotFilled, $"'{name}' is already filled by the page's content");
    }

    static Outcome Runs(RunDirectly runDirectly) => runDirectly.Available
        ? new(false, "Runs directly: every input has a source", Opens.None)
        : CannotPlace(PlacementProblem.InputsWithoutSource, runDirectly.Reason);

    [GeneratedRegex("(?<a>[a-z0-9])(?<b>[A-Z])", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex WordBoundary();

    [GeneratedRegex("(?<a>[A-Z]+)(?<b>[A-Z][a-z])", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex AcronymBoundary();

    sealed record Outcome(
        bool Routed,
        string Reason,
        Opens? Resolved = null,
        ScreenFit? Fit = null,
        string? Slot = null,
        PlacementRoute? Route = null,
        PlacementProblem? Problem = null);
}
