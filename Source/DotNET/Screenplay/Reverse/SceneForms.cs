// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Scene command forms to Screenplay module forms and back. A screen reaches its forms through an 'action' for each form's
/// command, which is how the stage plan attaches a module form to a screen.
/// </summary>
static class SceneForms
{
    /// <summary>
    /// A field that is a picker: `choose from query &lt;Query&gt; show &lt;field&gt;`.
    /// </summary>
    public const string ChoicesMember = "choices";

    const string ItemPath = "item";

    static readonly string[] _formMembers = ["name", "forCommand", "populateSource", "generationMode", "layout", "fields", "behaviors"];
    static readonly string[] _fieldMembers = ["name", "sourceProperty", "composeUsing", "label", "placement", ChoicesMember];

    public static FormSyntax? ToSyntax(JsonObject form, SceneScreenNames names, SceneTransportGaps gaps)
    {
        var name = SceneJson.String(form, "name");
        var command = SceneJson.String(form, "forCommand");
        var owner = $"form '{name}'";
        if (!SceneJson.IsIdentifier(name) || !SceneJson.IsPath(command))
        {
            gaps.Add($"Scene form '{name}' for '{command}' cannot travel as typed Screenplay: its name or command is not a Screenplay name.");
            return null;
        }

        gaps.UnknownMembers(form, owner, _formMembers);
        var generation = form["generationMode"] is { } mode ? SceneJson.Index(mode, SceneEnumerations.GenerationModes) : null;
        if (form["generationMode"] is not null && generation is null)
        {
            gaps.Member(owner, "generationMode", "it is not 'auto' or 'manual'");
        }

        return new(name!, command!, Populate(form["populateSource"] as JsonObject, owner, gaps), [.. Fields(form, owner, gaps)], null, SourceLocation.Start)
        {
            GenerationMode = generation is { } index ? (FormGenerationMode)(index + 1) : FormGenerationMode.Unspecified,
            Layout = SceneFormGeometry.ToSyntax(form, owner, gaps),
            Behaviors = SceneBehaviors.ToSyntax(form["behaviors"], owner, names, gaps)
        };
    }

    /// <summary>
    /// A command form placed on a screen presents the form for its command. A stage shows a screen's module forms, so a command form
    /// whose command the screen has no form for gets the one that follows the command - the 'auto' form - which is all it asked
    /// for. A command that is not a Screenplay name (one the board does not declare) cannot have a form, and is left to the gap its
    /// element already reports.
    /// </summary>
    public static FormSyntax[] WithPlacedCommandForms(JsonObject screen, FormSyntax[] forms)
    {
        var missing = PlacedCommands(screen["slotContent"]).Where(command => SceneJson.IsIdentifier(command) && forms.All(form => form.For != command)).Distinct(StringComparer.Ordinal);
        return [.. forms, .. missing.Select(command => new FormSyntax(command, command, null, [], null, SourceLocation.Start) { GenerationMode = FormGenerationMode.Auto })];
    }

    public static JsonObject ToJson(FormSyntax form, SceneScreenNames names)
    {
        var fieldsPlacedOnTheirOwn = SceneFormGeometry.PlacesFieldsOnTheirOwn(form.Layout);
        var json = new JsonObject
        {
            ["name"] = form.Name,
            ["forCommand"] = form.For,
            ["fields"] = new JsonArray([.. form.Fields.Select(field => (JsonNode)Field(field, fieldsPlacedOnTheirOwn ? form.Layout : null))])
        };

        if (form.Populate is { } populate)
        {
            json["populateSource"] = Populate(populate);
        }

        if (form.GenerationMode != FormGenerationMode.Unspecified)
        {
            json["generationMode"] = SceneEnumerations.GenerationModes[(int)form.GenerationMode - 1];
        }

        if (form.Layout is { } layout && !fieldsPlacedOnTheirOwn)
        {
            json["layout"] = SceneFormGeometry.ToJson(layout);
        }

        var behaviors = SceneBehaviors.ToJson(form.Behaviors, names);
        if (behaviors.Count > 0)
        {
            json["behaviors"] = behaviors;
        }

        return json;
    }

    static IEnumerable<FormFieldSyntax> Fields(JsonObject form, string owner, SceneTransportGaps gaps)
    {
        foreach (var field in SceneJson.Array(form, "fields").OfType<JsonObject>())
        {
            var name = SceneJson.String(field, "name");
            gaps.UnknownMembers(field, $"{owner} field '{name}'", _fieldMembers);
            var source = SceneJson.String(field, "sourceProperty");
            var compose = SceneJson.String(field, "composeUsing");
            if (!SceneJson.IsPath(name) || (source is not null && !SceneJson.IsPath(source)) || (compose is not null && !SceneJson.IsIdentifier(compose)) || (source is not null && compose is not null))
            {
                gaps.Member(owner, $"fields.{name}", $"its name, source or composer is not one Screenplay {ScreenplayVersion.Current} can write");
                continue;
            }

            var choices = Choices(field, owner, name!, gaps);
            if (field[ChoicesMember] is not null && choices is null)
            {
                continue;
            }

            yield return new FormFieldSyntax(name!, SceneJson.String(field, "label"), source, compose, SourceLocation.Start) { Choices = choices };
        }
    }

    static FormFieldChoicesSyntax? Choices(JsonObject field, string owner, string name, SceneTransportGaps gaps)
    {
        if (field[ChoicesMember] is null)
        {
            return null;
        }

        var choices = field[ChoicesMember] as JsonObject;
        var query = choices is null ? null : SceneJson.String(choices, "query");
        var show = choices is null ? null : SceneJson.String(choices, "show");
        if (choices is null || !SceneJson.IsPath(query) || !SceneJson.IsPath(show) || SceneJson.UnknownMembers(choices, ["query", "show"]).Any())
        {
            gaps.Member(owner, $"fields.{name}.{ChoicesMember}", $"it is not a query and one of its fields, as Screenplay {ScreenplayVersion.Current} writes `choose from query`");
            return null;
        }

        return new FormFieldChoicesSyntax(query!, show!, SourceLocation.Start);
    }

    static JsonObject Field(FormFieldSyntax field, CommandFormLayoutSyntax? placedOnTheirOwn)
    {
        var json = new JsonObject { ["name"] = field.Property };
        SceneValues.Optional(json, "sourceProperty", field.From);
        SceneValues.Optional(json, "composeUsing", field.ComposeUsing);
        SceneValues.Optional(json, "label", field.Label);
        if (field.Choices is { } choices)
        {
            json[ChoicesMember] = new JsonObject { ["query"] = choices.Query, ["show"] = choices.Show };
        }

        if (placedOnTheirOwn?.Placements.FirstOrDefault(placement => placement.Field == field.Property) is { } placement)
        {
            json["placement"] = SceneFormGeometry.ToJson(placement);
        }

        return json;
    }

    static FormPopulateSource? Populate(JsonObject? populate, string owner, SceneTransportGaps gaps)
    {
        if (populate is null)
        {
            return null;
        }

        if (SceneJson.String(populate, "queryName") is { } query && SceneJson.IsPath(query))
        {
            var bindings = SceneJson.Object(populate, "parameterBindings") ?? [];
            var by = bindings.Select(binding => binding.Key).FirstOrDefault();
            if (bindings.Count > 1 || (by is not null && Canonical(bindings[by]) != Canonical(SceneValues.FromPath(by))) || SceneJson.UnknownMembers(populate, ["queryName", "parameterBindings"]).Any())
            {
                gaps.Member(owner, "populateSource", $"Screenplay {ScreenplayVersion.Current} populates through a query by at most one parameter of the same name");
            }

            return new FormPopulateViaQuerySyntax(query, by, SourceLocation.Start);
        }

        if (populate["itemBinding"] is { } item && populate.Count == 1 && Canonical(item) == Canonical(SceneValues.FromPath(ItemPath)))
        {
            return new FormPopulateFromItemSyntax(SourceLocation.Start);
        }

        gaps.Member(owner, "populateSource", $"Screenplay {ScreenplayVersion.Current} populates from a query or from the current item only");
        return null;
    }

    static JsonObject Populate(FormPopulateSource populate) => populate switch
    {
        FormPopulateViaQuerySyntax query => new()
        {
            ["queryName"] = query.Query,
            ["parameterBindings"] = query.By is { } by ? new JsonObject { [by] = SceneValues.FromPath(by) } : []
        },
        _ => new() { ["itemBinding"] = SceneValues.FromPath(ItemPath) }
    };

    static string Canonical(JsonNode? node) => SceneDocumentCanonicalForm.Of(node?.DeepClone());

    static IEnumerable<string> PlacedCommands(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject json:
                if (SceneJson.String(json, "componentName") is { } component && component[(component.LastIndexOfAny([':', '.']) + 1)..] == "commandForm" &&
                    SceneJson.Object(json, "properties") is { } properties && SceneJson.String(properties, "command") is { Length: > 0 } command)
                {
                    yield return command;
                }

                foreach (var nested in json.SelectMany(member => PlacedCommands(member.Value)))
                {
                    yield return nested;
                }

                break;
            case JsonArray array:
                foreach (var nested in array.SelectMany(PlacedCommands))
                {
                    yield return nested;
                }

                break;
        }
    }
}
