// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The screen directives that name a piece of content - title, data, table and summary - are core components of Scene. They import as the
/// typed elements Stage's own conversion gives them (core:title, core:data, core:table with core:column children, core:summary with
/// core:field children), so an imported screen opens in the screen editor with that content on its canvas instead of as an empty page
/// (StudioIssues#902), and they export as the same directive again. A `toolbar &lt;name&gt;` of buttons imports as the outlet of actions Scene 5
/// draws a toolbar with (core:outletItems), so its buttons are edited - their slice, emphasis and hook - instead of kept as text. A directive that says more than its element can hold - a table
/// with a row click or behaviors - stays in the native residue as before. An element that says more than the directive can (another
/// property, a behavior, a child that is not a column) exports in the long `component core.*` form.
/// </summary>
static class SceneCoreDirectives
{
    const string Title = "core:title";
    const string Data = "core:data";
    const string Table = "core:table";
    const string Column = "core:column";
    const string Summary = "core:summary";
    const string Field = "core:field";
    const string TypeName = "typeName";
    const string OutletItems = "core:outletItems";
    const string Actions = "actions";

    public static bool IsElement(ScreenDirectiveSyntax directive) => directive switch
    {
        ScreenTitleSyntax => true,
        ScreenDataSyntax data => !data.Type.IsOptional,
        ScreenNeedSyntax => true,
        ScreenTableSyntax table => table.RowClick is null && !table.Behaviors.Any() && !table.UsedBehaviors.Any(),
        ScreenSummarySyntax => true,
        ScreenToolbarSyntax toolbar => !toolbar.Items.Any() && toolbar.Buttons.Any(),
        _ => false
    };

    public static JsonObject? ToElement(ScreenDirectiveSyntax directive, SceneScreenNames names) => directive switch
    {
        ScreenTitleSyntax title => Component(names, "title", title.Text, Title, new() { ["text"] = title.Text }),
        ScreenDataSyntax data => Component(names, $"data-{Slug(data.Type.Name)}", $"Data {data.Type.Name}", Data, new()
        {
            [TypeName] = data.Type.Name,
            ["isCollection"] = data.Type.IsCollection,
            ["query"] = data.Query,
            ["by"] = data.By
        }),
        ScreenNeedSyntax need => Component(names, $"data-{Slug(need.Alias ?? need.Type.Name)}", $"Data {need.Alias ?? need.Type.Name}", Data, new()
        {
            [TypeName] = need.Type.Name,
            ["isCollection"] = need.Type.IsCollection,
            ["need"] = need.Alias
        }),
        ScreenTableSyntax table => WithChildren(
            Component(names, $"table-{Slug(table.Target)}", $"Table {table.Target}", Table, new() { [TypeName] = table.Target }),
            "columns",
            table.Columns.Select(column => (column.Property, column.Label)),
            Column,
            "column",
            names),
        ScreenSummarySyntax summary => WithChildren(
            Component(names, $"summary-{Slug(summary.Target)}", $"Summary {summary.Target}", Summary, new() { [TypeName] = summary.Target }),
            "fields",
            summary.Fields.Select(field => (field.Property, (string?)field.Label)),
            Field,
            "field",
            names),
        ScreenToolbarSyntax toolbar => Toolbar(toolbar, names),
        _ => null
    };

    /// <summary>
    /// The directive an element is, when it is exactly what such a directive writes; otherwise null and the element travels as a component.
    /// </summary>
    public static ScreenDirectiveSyntax? TryToDirective(JsonObject element)
    {
        if (!SceneJson.IsEmpty(element["behaviors"]) || element[SceneNative.Member] is not null)
        {
            return null;
        }

        var properties = SceneJson.Object(element, "properties") ?? [];
        var slots = SceneJson.Object(element, "slots") ?? [];

        // An element a directive imports as carries the id and the name the import gives it; one that has others (an editor's own
        // 'details-title') would lose them in a directive, so it travels as the component it is.
        return SceneJson.String(element, "componentName") switch
        {
            Title when OnlyMembers(properties, "text") && slots.Count == 0 && String(properties, "text") is { } text && IsImported(element, "title", text) =>
                new ScreenTitleSyntax(text, SourceLocation.Start),
            Data when OnlyMembers(properties, TypeName, "isCollection", "need") && slots.Count == 0 && NeedOf(properties) is { } need
                && IsImported(element, $"data-{Slug(need.Alias ?? need.Type.Name)}", $"Data {need.Alias ?? need.Type.Name}") => need,
            Data when OnlyMembers(properties, TypeName, "isCollection", "query", "by") && slots.Count == 0 && DataOf(properties) is { } data
                && IsImported(element, $"data-{Slug(data.Type.Name)}", $"Data {data.Type.Name}") => data,
            Table when OnlyMembers(properties, TypeName) && String(properties, TypeName) is { } target && IsImported(element, $"table-{Slug(target)}", $"Table {target}")
                && Children(element, slots, "columns", Column, "column") is { } columns =>
                new ScreenTableSyntax(target, columns.Select(column => new ScreenColumnSyntax(column.Property, column.Label, SourceLocation.Start)), null, SourceLocation.Start),
            Summary when OnlyMembers(properties, TypeName) && String(properties, TypeName) is { } target && IsImported(element, $"summary-{Slug(target)}", $"Summary {target}")
                && Children(element, slots, "fields", Field, "field") is { } fields && fields.TrueForAll(field => field.Label is not null) =>
                new ScreenSummarySyntax(target, fields.Select(field => new ScreenFieldSyntax(field.Property, field.Label!, SourceLocation.Start)), SourceLocation.Start),
            OutletItems when OnlyMembers(properties, "name", "kind", "items") && slots.Count == 0 && String(properties, "kind") == Actions &&
                String(properties, "name") is { } name && SceneJson.IsIdentifier(name) && IsImported(element, $"toolbar-{Slug(name)}", $"Toolbar {name}") =>
                ToolbarOf(name, properties["items"]),
            _ => null
        };
    }

    /// <summary>
    /// A toolbar is the outlet of actions it places, named by the toolbar's name, holding its buttons.
    /// </summary>
    static JsonObject Toolbar(ScreenToolbarSyntax toolbar, SceneScreenNames names)
    {
        var element = Component(names, $"toolbar-{Slug(toolbar.Name)}", $"Toolbar {toolbar.Name}", OutletItems, new() { ["name"] = toolbar.Name, ["kind"] = Actions });
        element["properties"]!["items"] = SceneOutletItems.ToJson(toolbar.Buttons);
        return element;
    }

    /// <summary>
    /// The toolbar an outlet of actions is, when every item is a button a toolbar can say exactly.
    /// </summary>
    static ScreenToolbarSyntax? ToolbarOf(string name, JsonNode? items)
    {
        if (items is not JsonArray array || array.Count == 0)
        {
            return null;
        }

        var gaps = new SceneTransportGaps();
        var buttons = SceneOutletItems.ToSyntax(array, $"toolbar '{name}'", gaps);
        if (gaps.Any || buttons.Count != array.Count || !buttons.All(button => button is ToolbarButtonSyntax { Position: null }))
        {
            return null;
        }

        return new ScreenToolbarSyntax(name, [], SourceLocation.Start) { Buttons = [.. buttons.Cast<ToolbarButtonSyntax>()] };
    }

    /// <summary>
    /// A need is data a screen reads and no query provides yet: the shape, whether it is a list and, when the screen needs the shape twice, the alias that tells them apart.
    /// </summary>
    static ScreenNeedSyntax? NeedOf(JsonObject properties) =>
        String(properties, TypeName) is { } type && properties["query"] is null &&
        properties["isCollection"] is JsonValue collection && collection.TryGetValue<bool>(out var isCollection) &&
        (properties["need"] is null || String(properties, "need") is not null)
            ? new ScreenNeedSyntax(new TypeRefSyntax(type, isCollection, false, SourceLocation.Start), String(properties, "need"), SourceLocation.Start)
            : null;

    static ScreenDataSyntax? DataOf(JsonObject properties) =>
        String(properties, TypeName) is { } type && String(properties, "query") is { } query &&
        properties["isCollection"] is JsonValue collection && collection.TryGetValue<bool>(out var isCollection) &&
        (properties["by"] is null || String(properties, "by") is not null)
            ? new ScreenDataSyntax(new TypeRefSyntax(type, isCollection, false, SourceLocation.Start), query, String(properties, "by"), SourceLocation.Start)
            : null;

    /// <summary>
    /// The (property, label) pairs of the only outlet of a table or a summary, each a plain child of the one component name; null when the
    /// outlet holds anything else.
    /// </summary>
    static List<(string Property, string? Label)>? Children(JsonObject parent, JsonObject slots, string outlet, string componentName, string kind)
    {
        if (slots.Count != 1 || slots[outlet] is not JsonArray children)
        {
            return null;
        }

        List<(string, string?)> result = [];
        foreach (var child in children.OfType<JsonObject>())
        {
            var properties = SceneJson.Object(child, "properties") ?? [];
            if (SceneJson.String(child, "componentName") != componentName || !SceneJson.IsEmpty(child["behaviors"]) || child[SceneNative.Member] is not null ||
                !SceneJson.IsEmpty(child["slots"]) || !OnlyMembers(properties, "property", "label") || String(properties, "property") is not { } property ||
                (properties["label"] is not null && String(properties, "label") is null))
            {
                return null;
            }

            var label = String(properties, "label");
            if (!IsImported(child, $"{SceneJson.String(parent, "id")}-{kind}-{Slug(property)}", label ?? property))
            {
                return null;
            }

            result.Add((property, label));
        }

        return children.Count == result.Count ? result : null;
    }

    /// <summary>
    /// Whether an element has the id the import gives one with this stem (the stem itself, or the stem and the number that keeps it unique) and the name it gives it.
    /// </summary>
    static bool IsImported(JsonObject element, string stem, string name)
    {
        var id = SceneJson.String(element, "id");
        if (id is null || SceneJson.String(element, "name") != name || !id.StartsWith(stem, StringComparison.Ordinal))
        {
            return false;
        }

        return id.Length == stem.Length || (id[stem.Length] == '-' && int.TryParse(id[(stem.Length + 1)..], out _));
    }

    static string? String(JsonObject properties, string name) => properties[name] is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    static bool OnlyMembers(JsonObject properties, params string[] names) => properties.All(property => names.Contains(property.Key, StringComparer.Ordinal));

    static JsonObject Component(SceneScreenNames names, string idStem, string name, string componentName, Dictionary<string, object?> properties)
    {
        var element = SceneElementImport.Base(names.UniqueElementId(idStem), name, [], names);
        element["componentName"] = componentName;
        element["properties"] = new JsonObject(properties.Select(property => KeyValuePair.Create<string, JsonNode?>(property.Key, Node(property.Value))));
        element["slots"] = new JsonObject();
        return element;
    }

    static JsonValue? Node(object? value) => value switch
    {
        string text => JsonValue.Create(text),
        bool flag => JsonValue.Create(flag),
        _ => null
    };

    static JsonObject WithChildren(JsonObject parent, string outlet, IEnumerable<(string Property, string? Label)> children, string componentName, string kind, SceneScreenNames names)
    {
        var id = parent["id"]!.GetValue<string>();
        parent["slots"] = new JsonObject
        {
            [outlet] = new JsonArray([.. children.Select(child => (JsonNode)Component(
                names,
                $"{id}-{kind}-{Slug(child.Property)}",
                child.Label ?? child.Property,
                componentName,
                new() { ["property"] = child.Property, ["label"] = child.Label }))])
        };
        return parent;
    }

    /// <summary>
    /// An id stem: lower case letters, digits and dashes, so an id reads the same in the editor, the document and a url.
    /// </summary>
    static string Slug(string text)
    {
        var slug = new string([.. text.Select(character => char.IsLetterOrDigit(character) ? char.ToLowerInvariant(character) : '-')]).Trim('-');
        return slug.Length == 0 ? "item" : slug;
    }
}
