// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Inspects actions for an editor - the buttons and menu entries of an outlet of actions, and the <c language="csharp">action</c>
/// component, through the one model they share: where each comes from, where its slice opens and whether it can be used,
/// each with the reason. The TypeScript twins are <c language="csharp">inspectOutletActions</c> and
/// <c language="csharp">inspectActionElement</c>; both are asserted against the shared <c language="csharp">placement-fixtures.json</c>.
/// </summary>
public static class ActionInspector
{
    /// <summary>
    /// Tells where an <c language="csharp">action</c> component's argument source gets its value: <c language="csharp">component.&lt;id&gt;.&lt;output&gt;</c>
    /// is another component's output, <c language="csharp">route.&lt;parameter&gt;</c> a route value, and any other path the data context.
    /// </summary>
    /// <param name="source">The argument's source as stored on the element.</param>
    /// <returns>Where it gets its value, or <see langword="null"/> when it has none.</returns>
    public static InputSourceKind? ArgumentSourceKind(string? source)
    {
        if (string.IsNullOrWhiteSpace(source))
        {
            return null;
        }

        if (source.StartsWith("component.", StringComparison.Ordinal))
        {
            return InputSourceKind.Component;
        }

        return source.StartsWith("route.", StringComparison.Ordinal) ? InputSourceKind.Route : InputSourceKind.DataContext;
    }

    /// <summary>
    /// Inspects every action of a resolved outlet of actions - its buttons and menu entries, and those inside its groups.
    /// An action's subject is its own, or the outlet's; its authorization is its own, or that of the command its slice submits.
    /// </summary>
    /// <param name="outlet">The resolved outlet.</param>
    /// <param name="context">The slices the actions run, the page's slots and the state to check enablement against.</param>
    /// <returns>One inspection per action, in the outlet's order.</returns>
    public static IReadOnlyList<ActionInspection> InspectOutlet(EffectiveOutlet outlet, ActionInspectionContext context)
    {
        var result = new List<ActionInspection>();
        void Add(OutletItem item, OutletProvenance provenance, bool editable, string? group)
        {
            if (item is not (OutletButton or OutletMenuEntry) || item is not OutletAction action)
            {
                return;
            }

            var shape = new ActionShape(
                action.Id,
                action.Title,
                SliceOf(context, action.Slice, action.Command),
                action.Opens,
                action.OpensIn,
                action.Subject ?? outlet.Subject,
                action.EnabledWhen,
                action.Authorize);
            result.Add(Inspect(shape, context) with { Group = group, Provenance = provenance, Editable = editable });
        }

        foreach (var entry in outlet.Items)
        {
            if (entry.Item is OutletGroup group)
            {
                foreach (var child in group.Items)
                {
                    Add(child, entry.Provenance, entry.Editable, group.Id);
                }

                continue;
            }

            Add(entry.Item, entry.Provenance, entry.Editable, null);
        }

        return result;
    }

    /// <summary>
    /// Inspects an <c language="csharp">action</c> component through the same model as an outlet's actions. Its command names the
    /// slice (by the command it submits, or by the slice's id), and its argument mapping gives each input its source, falling
    /// back to the slice's own.
    /// </summary>
    /// <param name="element">The <c language="csharp">action</c> component.</param>
    /// <param name="context">The slices, the page's slots and the state to check enablement against.</param>
    /// <returns>The inspection.</returns>
    public static ActionInspection InspectElement(SceneElement element, ActionInspectionContext context)
    {
        var properties = element.Properties;
        var command = Text(properties, "command");
        var slice = command is null ? null : context.Slices.FirstOrDefault(candidate => candidate.Command == command || candidate.Id == command);
        var mapping = ArgumentsOf(properties);
        var inputs = slice?.Inputs
            .Select(input => mapping.TryGetValue(input.Name, out var source) ? new PlacementInput(input.Name, ArgumentSourceKind(source)) : input)
            .ToList();

        var shape = new ActionShape(
            element.Id,
            Text(properties, "label") ?? command ?? element.Id,
            slice,
            Enum.TryParse<Opens>(Text(properties, "opens"), ignoreCase: true, out var opens) ? opens : null,
            Text(properties, "opensIn"),
            Enum.TryParse<OutletSubject>(Text(properties, "subject"), ignoreCase: true, out var subject) ? subject : null,
            Text(properties, "enabledWhen"),
            Text(properties, "authorize"),
            inputs);
        return Inspect(shape, context);
    }

    static ActionInspection Inspect(ActionShape action, ActionInspectionContext context)
    {
        var slice = action.Slice;
        var placement = slice is null
            ? null
            : PlacementResolver.Resolve(new(
                slice.Id,
                action.Inputs ?? slice.Inputs,
                context.Slots,
                action.Opens,
                action.OpensIn,
                slice.Screen,
                slice.Fits,
                context.RouteValues));
        var enablement = EnablementResolver.Resolve(new(
            action.Subject,
            context.Selected,
            context.Item,
            action.Authorize ?? slice?.Authorize,
            context.Persona,
            action.EnabledWhen,
            ConditionHolds: context.Conditions is not null && context.Conditions.TryGetValue(action.Id, out var holds) ? holds : null));
        return new(action.Id, action.Title, enablement, Slice: slice?.Id, Placement: placement);
    }

    static ActionSlice? SliceOf(ActionInspectionContext context, string? slice, string? command)
    {
        if (slice is not null)
        {
            return context.Slices.FirstOrDefault(candidate => candidate.Id == slice);
        }

        return command is null ? null : context.Slices.FirstOrDefault(candidate => candidate.Command == command);
    }

    static JsonElement? ElementOf(IReadOnlyDictionary<string, object?> properties, string name)
    {
        if (!properties.TryGetValue(name, out var value) || value is null)
        {
            return null;
        }

        return value as JsonElement? ?? JsonSerializer.SerializeToElement(value);
    }

    static string? Text(IReadOnlyDictionary<string, object?> properties, string name) =>
        ElementOf(properties, name) is { ValueKind: JsonValueKind.String } value && value.GetString() is { Length: > 0 } text ? text : null;

    static Dictionary<string, string?> ArgumentsOf(IReadOnlyDictionary<string, object?> properties)
    {
        var mapping = new Dictionary<string, string?>(StringComparer.Ordinal);
        if (ElementOf(properties, "arguments") is not { ValueKind: JsonValueKind.Array } arguments)
        {
            return mapping;
        }

        foreach (var argument in arguments.EnumerateArray())
        {
            if (argument.ValueKind != JsonValueKind.Object || !argument.TryGetProperty("name", out var name) || name.ValueKind != JsonValueKind.String)
            {
                continue;
            }

            var source = argument.TryGetProperty("source", out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;
            mapping.TryAdd(name.GetString()!, source);
        }

        return mapping;
    }

    sealed record ActionShape(
        string Id,
        string Title,
        ActionSlice? Slice,
        Opens? Opens,
        string? OpensIn,
        OutletSubject? Subject,
        string? EnabledWhen,
        string? Authorize,
        IReadOnlyList<PlacementInput>? Inputs = null);
}
