// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What templates and layouts let their users configure, and what each instance configures, as typed Screenplay 'exposure'
/// and 'instance' declarations - and back. A Scene instance is 'screen:&lt;name&gt;', 'template:&lt;name&gt;' or 'dialog:&lt;name&gt;';
/// Screenplay names the screen or template alone, so a role's screens are named the way the role's screens are.
/// </summary>
static class SceneExposures
{
    public const string ScreenInstance = "screen:";
    public const string TemplateInstance = "template:";
    public const string DialogInstance = "dialog:";

    static readonly string[] _exposureMembers = ["owner", "properties"];
    static readonly string[] _propertyMembers = ["component", "path", "label", "operations", "editableFields", "reExposes"];
    static readonly string[] _instanceMembers = ["instance", "component", "path", "value", "items"];
    static readonly string[] _itemMembers = ["id", "values"];

    public static IEnumerable<ExposureSyntax> Exposures(JsonObject root, SceneTransportGaps gaps) =>
        SceneJson.Array(root, "exposures").Select(exposure => ToExposure(exposure, gaps)).OfType<ExposureSyntax>();

    public static IEnumerable<InstanceContributionsSyntax> Instances(JsonObject root, SceneScreenNames names, SceneTransportGaps gaps)
    {
        List<(string Instance, InstanceContributionSyntax Contribution)> contributions = [];
        foreach (var node in SceneJson.Array(root, "instanceContributions"))
        {
            if (ToContribution(node, names, gaps) is { } contribution)
            {
                contributions.Add(contribution);
            }
        }

        return contributions
            .GroupBy(contribution => contribution.Instance, StringComparer.Ordinal)
            .Select(group => new InstanceContributionsSyntax(group.Key, [.. group.Select(entry => entry.Contribution)], SourceLocation.Start));
    }

    public static JsonObject ToJson(ExposureSyntax exposure) => new()
    {
        ["owner"] = exposure.Owner,
        ["properties"] = new JsonArray([.. exposure.Properties.Select(property => (JsonNode)ToJson(property))])
    };

    /// <summary>
    /// The contributions of an instance, as the role reading them back sees it: its own screens are 'screen:', templates
    /// and dialog templates are named by kind, and another role's screen is not this role's to read.
    /// </summary>
    public static IEnumerable<JsonObject> ToJson(InstanceContributionsSyntax instance, SceneScreenNames names, IReadOnlySet<string> screens, IReadOnlySet<string> templates, IReadOnlySet<string> dialogs)
    {
        if (SceneInstance(instance.Instance, names, screens, templates, dialogs) is not { } sceneInstance)
        {
            return [];
        }

        return instance.Contributions.Select(contribution =>
        {
            var json = new JsonObject
            {
                ["instance"] = sceneInstance,
                ["component"] = contribution.Component,
                ["path"] = contribution.Path
            };

            if (contribution.Value is not null)
            {
                json["value"] = SceneValues.ToJson(contribution.Value);
            }
            else
            {
                json["items"] = new JsonArray([.. contribution.Items.Select(item => (JsonNode)new JsonObject
                {
                    ["id"] = item.Id,
                    ["values"] = new JsonObject(item.Values.Select(value => KeyValuePair.Create(value.Field, SceneValues.ToJson(value.Value))))
                })]);
            }

            return json;
        });
    }

    public static bool IsScreenInstance(string instance, IReadOnlySet<string> screens) => screens.Contains(instance);

    static string? SceneInstance(string instance, SceneScreenNames names, IReadOnlySet<string> screens, IReadOnlySet<string> templates, IReadOnlySet<string> dialogs)
    {
        if (screens.Contains(instance))
        {
            return names.Owns(instance) ? ScreenInstance + names.SceneNameFor(instance) : null;
        }

        if (templates.Contains(instance))
        {
            return TemplateInstance + instance;
        }

        return dialogs.Contains(instance) ? DialogInstance + instance : null;
    }

    static ExposureSyntax? ToExposure(JsonNode? node, SceneTransportGaps gaps)
    {
        if (node is not JsonObject exposure || SceneJson.String(exposure, "owner") is not { } owner || !SceneJson.IsIdentifier(owner))
        {
            gaps.Add("Scene exposure without an owner named like a Screenplay layout or template cannot travel as typed Screenplay.");
            return null;
        }

        var scope = $"exposure for '{owner}'";
        gaps.UnknownMembers(exposure, scope, _exposureMembers);
        return new ExposureSyntax(owner, [.. SceneJson.Array(exposure, "properties").Select(property => ToProperty(property, scope, gaps)).OfType<ExposedPropertySyntax>()], SourceLocation.Start);
    }

    static ExposedPropertySyntax? ToProperty(JsonNode? node, string scope, SceneTransportGaps gaps)
    {
        if (node is not JsonObject property || SceneJson.String(property, "component") is not { Length: > 0 } component || SceneJson.String(property, "path") is not { } path || !SceneJson.IsPath(path))
        {
            gaps.Add($"Scene {scope} has a property without a component and a property path, which cannot travel as typed Screenplay.");
            return null;
        }

        var owner = $"{scope} property '{component}.{path}'";
        gaps.UnknownMembers(property, owner, _propertyMembers);
        return new ExposedPropertySyntax(component, path, SourceLocation.Start)
        {
            Label = SceneJson.String(property, "label"),
            IsCollection = property["operations"] is JsonArray,
            Operations = Names(property, "operations", owner, gaps),
            RestrictsFields = property["editableFields"] is JsonArray,
            EditableFields = Names(property, "editableFields", owner, gaps),
            ReExposes = SceneJson.String(property, "reExposes")
        };
    }

    static JsonObject ToJson(ExposedPropertySyntax property)
    {
        var json = new JsonObject { ["component"] = property.Component, ["path"] = property.Path };
        SceneValues.Optional(json, "label", property.Label);
        if (property.IsCollection)
        {
            json["operations"] = new JsonArray([.. property.Operations.Select(operation => (JsonNode?)JsonValue.Create(operation))]);
        }

        if (property.RestrictsFields)
        {
            json["editableFields"] = new JsonArray([.. property.EditableFields.Select(field => (JsonNode?)JsonValue.Create(field))]);
        }

        SceneValues.Optional(json, "reExposes", property.ReExposes);
        return json;
    }

    static (string Instance, InstanceContributionSyntax Contribution)? ToContribution(JsonNode? node, SceneScreenNames names, SceneTransportGaps gaps)
    {
        if (node is not JsonObject contribution || SceneJson.String(contribution, "component") is not { Length: > 0 } component || SceneJson.String(contribution, "path") is not { } path || !SceneJson.IsPath(path))
        {
            gaps.Add("Scene instance contribution without a component and a property path cannot travel as typed Screenplay.");
            return null;
        }

        var instance = ScreenplayInstance(SceneJson.String(contribution, "instance"), names);
        if (instance is null)
        {
            gaps.Add($"Scene instance contribution to '{component}.{path}' names an instance that is not 'screen:', 'template:' or 'dialog:' followed by a Screenplay name, so it cannot travel as typed Screenplay.");
            return null;
        }

        var owner = $"instance contribution '{SceneJson.String(contribution, "instance")}' to '{component}.{path}'";
        gaps.UnknownMembers(contribution, owner, _instanceMembers);
        if (contribution["items"] is not null && contribution.ContainsKey("value"))
        {
            gaps.Member(owner, "value", "an instance contribution sets a value or contributes items, not both");
        }

        var items = SceneJson.Array(contribution, "items").Select(item => ToItem(item, owner, gaps)).OfType<ContributedItemSyntax>().ToArray();
        var value = contribution["items"] is null && contribution.ContainsKey("value") ? SceneValues.ToExpression(contribution["value"]) : null;
        return (instance, new InstanceContributionSyntax(component, path, value, items, SourceLocation.Start));
    }

    static ContributedItemSyntax? ToItem(JsonNode? node, string owner, SceneTransportGaps gaps)
    {
        if (node is not JsonObject item || SceneJson.String(item, "id") is not { Length: > 0 } id)
        {
            gaps.Add($"Scene {owner} has an item without an id, which cannot travel as typed Screenplay.");
            return null;
        }

        gaps.UnknownMembers(item, $"{owner} item '{id}'", _itemMembers);
        List<ContributedItemValueSyntax> values = [];
        foreach (var (field, value) in SceneJson.Object(item, "values") ?? [])
        {
            if (!SceneJson.IsIdentifier(field))
            {
                gaps.Member($"{owner} item '{id}'", "values." + field, "an item field must be a Screenplay name");
                continue;
            }

            values.Add(new ContributedItemValueSyntax(field, SceneValues.ToExpression(value), SourceLocation.Start));
        }

        return new ContributedItemSyntax(id, values, SourceLocation.Start);
    }

    static string? ScreenplayInstance(string? instance, SceneScreenNames names)
    {
        var name = instance switch
        {
            { } screen when screen.StartsWith(ScreenInstance, StringComparison.Ordinal) => screen[ScreenInstance.Length..] is var scene && (scene == SceneScreenNames.PrimarySceneScreen || SceneJson.IsIdentifier(scene)) ? names.ScreenplayNameFor(scene) : null,
            { } template when template.StartsWith(TemplateInstance, StringComparison.Ordinal) => template[TemplateInstance.Length..],
            { } dialog when dialog.StartsWith(DialogInstance, StringComparison.Ordinal) => dialog[DialogInstance.Length..],
            _ => null
        };

        return SceneJson.IsIdentifier(name) ? name : null;
    }

    static IReadOnlyList<string> Names(JsonObject node, string member, string owner, SceneTransportGaps gaps)
    {
        var values = SceneJson.Array(node, member).Select(value => value is JsonValue text && text.TryGetValue<string>(out var name) ? name : null).ToArray();
        if (values.Any(value => value is null))
        {
            gaps.Member(owner, member, "every entry must be text");
        }

        return [.. values.OfType<string>()];
    }
}
