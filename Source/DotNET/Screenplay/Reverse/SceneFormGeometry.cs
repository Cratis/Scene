// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Command-form geometry: the layout's columns, placements, gaps and widths. Screenplay places fields only through
/// the layout, so a form whose fields carry their own placements and no layout travels as a layout with placements and
/// no columns - a shape a Scene layout never has, since it always declares at least one column.
/// </summary>
static class SceneFormGeometry
{
    static readonly string[] _layoutMembers = ["columns", "placements", "columnGap", "rowGap"];
    static readonly string[] _columnMembers = ["index", "width", "minWidth", "maxWidth"];
    static readonly string[] _placementMembers = ["field", "row", "column", "rowSpan", "columnSpan", "width"];

    public static CommandFormLayoutSyntax? ToSyntax(JsonObject form, string owner, SceneTransportGaps gaps)
    {
        var fieldPlacements = SceneJson.Array(form, "fields").OfType<JsonObject>()
            .Where(field => field["placement"] is not null)
            .Select(field => (Field: SceneJson.String(field, "name"), Placement: field["placement"] as JsonObject))
            .ToArray();

        if (form["layout"] is not JsonObject layout)
        {
            return fieldPlacements.Length == 0
                ? null
                : new([], [.. fieldPlacements.Select(entry => Placement(entry.Placement, entry.Field, owner, gaps)).OfType<FormFieldPlacementSyntax>()], null, null, SourceLocation.Start);
        }

        if (fieldPlacements.Length > 0)
        {
            gaps.Member(owner, "fields.placement", $"Screenplay {ScreenplayVersion.Current} places a field either through the form layout or on its own, not both");
        }

        gaps.UnknownMembers(layout, owner + " layout", _layoutMembers);
        var columns = SceneJson.Array(layout, "columns").OfType<JsonObject>().Select(column => Column(column, owner, gaps)).OfType<FormLayoutColumnSyntax>().ToArray();
        if (columns.Length == 0)
        {
            gaps.Member(owner + " layout", "columns", "a layout without columns cannot be told apart from fields placed on their own");
        }

        return new(
            columns,
            [.. SceneJson.Array(layout, "placements").OfType<JsonObject>().Select(placement => Placement(placement, null, owner, gaps)).OfType<FormFieldPlacementSyntax>()],
            Width(layout["columnGap"], owner + " layout columnGap", gaps),
            Width(layout["rowGap"], owner + " layout rowGap", gaps),
            SourceLocation.Start);
    }

    public static bool PlacesFieldsOnTheirOwn(CommandFormLayoutSyntax? layout) => layout?.Columns.Any() == false;

    public static JsonObject ToJson(CommandFormLayoutSyntax layout)
    {
        var json = new JsonObject
        {
            ["columns"] = new JsonArray([.. layout.Columns.Select(column => (JsonNode)ToJson(column))]),
            ["placements"] = new JsonArray([.. layout.Placements.Select(placement => (JsonNode)ToJson(placement))])
        };

        Width(json, "columnGap", layout.ColumnGap);
        Width(json, "rowGap", layout.RowGap);
        return json;
    }

    public static JsonObject ToJson(FormFieldPlacementSyntax placement)
    {
        var json = new JsonObject { ["field"] = placement.Field, ["row"] = placement.Row, ["column"] = placement.Column };
        if (placement.RowSpan is { } rowSpan)
        {
            json["rowSpan"] = rowSpan;
        }

        if (placement.ColumnSpan is { } columnSpan)
        {
            json["columnSpan"] = columnSpan;
        }

        Width(json, "width", placement.Width);
        return json;
    }

    static JsonObject ToJson(FormLayoutColumnSyntax column)
    {
        var json = new JsonObject { ["index"] = column.Index };
        Width(json, "width", column.Width);
        Width(json, "minWidth", column.MinWidth);
        Width(json, "maxWidth", column.MaxWidth);
        return json;
    }

    static FormLayoutColumnSyntax? Column(JsonObject column, string owner, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(column, owner + " layout column", _columnMembers);
        if (SceneJson.Integer(column["index"]) is not { } index || index < 1)
        {
            gaps.Member(owner + " layout column", "index", $"Screenplay {ScreenplayVersion.Current} numbers columns from one");
            return null;
        }

        var scope = $"{owner} layout column {index}";
        return new(index, Width(column["width"], scope, gaps), Width(column["minWidth"], scope, gaps), Width(column["maxWidth"], scope, gaps), SourceLocation.Start);
    }

    static FormFieldPlacementSyntax? Placement(JsonObject? placement, string? field, string owner, SceneTransportGaps gaps)
    {
        var scope = owner + " placement";
        if (placement is null)
        {
            gaps.Member(owner, "fields.placement", "it is not a placement");
            return null;
        }

        gaps.UnknownMembers(placement, scope, _placementMembers);
        var name = SceneJson.String(placement, "field");
        if (name is null || (field is not null && name != field) || !SceneJson.IsPath(name))
        {
            gaps.Member(scope, "field", "it does not name the field it places");
            return null;
        }

        var row = SceneJson.Integer(placement["row"]);
        var column = SceneJson.Integer(placement["column"]);
        var rowSpan = SceneJson.Integer(placement["rowSpan"]);
        var columnSpan = SceneJson.Integer(placement["columnSpan"]);
        if (row is not > 0 || column is not > 0 || (placement["rowSpan"] is not null && rowSpan is not > 0) || (placement["columnSpan"] is not null && columnSpan is not > 0))
        {
            gaps.Member(scope, name, $"Screenplay {ScreenplayVersion.Current} places fields at positive whole rows, columns and spans");
            return null;
        }

        return new(name, row.Value, column.Value, rowSpan, columnSpan, Width(placement["width"], scope + " " + name, gaps), SourceLocation.Start);
    }

    static FormWidthSyntax? Width(JsonNode? width, string scope, SceneTransportGaps gaps)
    {
        if (width is null)
        {
            return null;
        }

        var unit = SceneJson.Index(SceneJson.Member(width, "unit"), SceneEnumerations.WidthUnits);
        var value = SceneJson.Number(SceneJson.Member(width, "value"));
        var isAuto = unit == (int)FormWidthUnitSyntax.Auto;
        if (width is not JsonObject json || unit is null || SceneJson.UnknownMembers(json, ["unit", "value"]).Any() ||
            (isAuto && json["value"] is not null) || (!isAuto && value is not >= 0))
        {
            gaps.Member(scope, "width", $"'{width.ToJsonString()}' is not a width Screenplay {ScreenplayVersion.Current} can write");
            return null;
        }

        return new((FormWidthUnitSyntax)unit, isAuto ? null : value, SourceLocation.Start);
    }

    static void Width(JsonObject json, string member, FormWidthSyntax? width)
    {
        if (width is null)
        {
            return;
        }

        var value = new JsonObject { ["unit"] = SceneEnumerations.WidthUnits[(int)width.Unit] };
        if (width.Value is { } number)
        {
            value["value"] = number;
        }

        json[member] = value;
    }
}
