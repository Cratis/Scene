// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// Reads, normalizes and resolves toolbar buttons. A spec toolbar button is a <c language="csharp">core:toolbarItem</c> with <c language="csharp">kind: Action</c>, a
/// <c language="csharp">slice</c> and an <c language="csharp">emphasis</c>; a hand-authored item that names a command in <c language="csharp">target</c> is converted on read
/// to the slice that accepts that command, when exactly one does.
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">toolbarButtonFromItem</c>, <c language="csharp">normalizeToolbarButton</c>, <c language="csharp">resolveToolbarButton</c>)
/// does the same; both are asserted against <c language="csharp">toolbar-slice-fixtures.json</c>.
/// </remarks>
public static class ToolbarButtons
{
    /// <summary>
    /// Reads a button from the properties of a <c language="csharp">core:toolbarItem</c> element.
    /// </summary>
    /// <param name="id">The element id.</param>
    /// <param name="properties">The element properties: <c language="csharp">label</c> (or <c language="csharp">name</c>), <c language="csharp">kind</c>, <c language="csharp">slice</c>, <c language="csharp">emphasis</c>, <c language="csharp">icon</c>, <c language="csharp">target</c>.</param>
    /// <returns>The button, or <see langword="null"/> when the item is not one that invokes a command or slice - a navigate or dialog item.</returns>
    public static ToolbarButton? FromItem(string id, IReadOnlyDictionary<string, object?> properties)
    {
        var slice = Text(properties, "slice");
        var action = string.Equals(Text(properties, "kind"), "action", StringComparison.OrdinalIgnoreCase);
        if (slice is null && !action)
        {
            return null;
        }

        ToolbarEmphasis? emphasis = Text(properties, "emphasis")?.ToLowerInvariant() switch
        {
            "primary" => ToolbarEmphasis.Primary,
            "secondary" => ToolbarEmphasis.Secondary,
            "quiet" => ToolbarEmphasis.Quiet,
            _ => null
        };
        return new ToolbarButton(id, Text(properties, "label") ?? Text(properties, "name") ?? id, slice, emphasis, Text(properties, "icon"), Text(properties, "target"));
    }

    /// <summary>
    /// Converts a hand-authored button to a slice-backed one: a button with no slice whose command is accepted by exactly one state change slice names that slice instead.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="button">The button.</param>
    /// <returns>The button to use, and whether it was converted. A button that cannot be converted is returned as it is.</returns>
    public static (ToolbarButton Button, bool Converted) Normalize(ApplicationStructureIndex index, ToolbarButton button)
    {
        if (!string.IsNullOrEmpty(button.Slice) || string.IsNullOrEmpty(button.Target))
        {
            return (button, false);
        }

        var matches = index.FindSlicesByCommand(button.Target);
        return matches.Count == 1 ? (button with { Slice = matches[0], Target = null }, true) : (button, false);
    }

    /// <summary>
    /// Resolves a button: its slice, command and task dialog, without any rendering.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="button">The button.</param>
    /// <param name="defaultDialogTemplate">The dialog template used when a slice names none; <see cref="SliceDialogs.DefaultTemplate"/> when <see langword="null"/>.</param>
    /// <returns>The resolved button.</returns>
    public static ResolvedToolbarButton Resolve(ApplicationStructureIndex index, ToolbarButton button, string? defaultDialogTemplate = null)
    {
        var (normalized, converted) = Normalize(index, button);
        var dialog = string.IsNullOrEmpty(normalized.Slice) ? null : SliceDialogs.For(index, normalized.Slice, defaultDialogTemplate);
        return new(
            normalized.Id,
            normalized.Title,
            normalized.Emphasis ?? ToolbarEmphasis.Secondary,
            converted,
            normalized.Icon,
            string.IsNullOrEmpty(normalized.Slice) ? null : normalized.Slice,
            dialog?.Command,
            dialog);
    }

    static string? Text(IReadOnlyDictionary<string, object?> properties, string name) => properties.TryGetValue(name, out var value) ? value switch
    {
        string text when text.Length > 0 => text,
        JsonElement { ValueKind: JsonValueKind.String } element when element.GetString() is { Length: > 0 } text => text,
        _ => null
    } : null;
}
