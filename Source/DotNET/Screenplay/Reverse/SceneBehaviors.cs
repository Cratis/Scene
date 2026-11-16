// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Scene behaviors on one side and Screenplay 'on' blocks on the other. Screenplay allows only anonymous 'on'
/// blocks inside a component, screen or form, and reads each one back as a behavior of its own, so a Scene behavior
/// travels as one anonymous behavior per binding.
/// </summary>
static class SceneBehaviors
{
    static readonly string[] _bindingMembers = ["trigger", "actions", "condition"];

    public static IReadOnlyList<BehaviorSyntax> ToSyntax(JsonNode? behaviors, string owner, SceneScreenNames names, SceneTransportGaps gaps)
    {
        List<BehaviorSyntax> result = [];
        foreach (var behavior in (behaviors as JsonArray ?? []).OfType<JsonObject>())
        {
            gaps.UnknownMembers(behavior, owner + " behavior", ["name", "bindings", "order"]);
            if (behavior["name"] is not null || behavior["order"] is not null)
            {
                gaps.Member(owner + " behavior", behavior["name"] is not null ? "name" : "order", $"Screenplay {ScreenplayVersion.Current} allows only anonymous 'on' blocks there");
            }

            foreach (var binding in SceneJson.Array(behavior, "bindings").OfType<JsonObject>())
            {
                if (ToSyntax(binding, owner, names, gaps) is { } syntax)
                {
                    result.Add(new BehaviorSyntax(null, [], [syntax], SourceLocation.Start));
                }
            }
        }

        return result;
    }

    public static JsonArray ToJson(IEnumerable<BehaviorSyntax> behaviors, SceneScreenNames names) =>
        [.. behaviors.SelectMany(behavior => behavior.Bindings).Select(binding => (JsonNode)new JsonObject { ["bindings"] = new JsonArray(ToJson(binding, names)) })];

    static InteractionBindingSyntax? ToSyntax(JsonObject binding, string owner, SceneScreenNames names, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(binding, owner + " interaction", _bindingMembers);
        var trigger = SceneTriggers.ToSyntax(binding["trigger"] as JsonObject, owner, gaps);
        if (trigger is null)
        {
            return null;
        }

        var condition = binding["condition"] is { } node ? SceneValues.ToPath(node, owner + " interaction", "condition", gaps) : null;
        var actions = SceneJson.Array(binding, "actions").OfType<JsonObject>().Select(action => SceneActions.ToSyntax(action, owner, names, gaps)).OfType<InteractionActionSyntax>();
        return new(trigger, condition, [.. actions], SourceLocation.Start);
    }

    static JsonObject ToJson(InteractionBindingSyntax binding, SceneScreenNames names)
    {
        var json = new JsonObject
        {
            ["trigger"] = SceneTriggers.ToJson(binding.Trigger),
            ["actions"] = new JsonArray([.. binding.Actions.Select(action => (JsonNode)SceneActions.ToJson(action, names))])
        };

        if (binding.Condition is { } condition)
        {
            json["condition"] = SceneValues.FromPath(condition);
        }

        return json;
    }
}
