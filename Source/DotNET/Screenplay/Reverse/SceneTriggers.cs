// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

static class SceneTriggers
{
    public static InteractionTriggerSyntax? ToSyntax(JsonObject? trigger, string owner, SceneTransportGaps gaps)
    {
        if (trigger is null)
        {
            gaps.Member(owner + " interaction", "trigger", "it is missing");
            return null;
        }

        gaps.UnknownMembers(trigger, owner + " trigger", ["kind", "eventName", "seconds", "triggerName"]);
        if (trigger["kind"] is { } kind)
        {
            if (SceneJson.Index(kind, SceneEnumerations.TriggerKinds) is { } index)
            {
                return new BuiltInInteractionTriggerSyntax((InteractionTriggerKind)index, SourceLocation.Start);
            }

            gaps.Member(owner + " trigger", "kind", $"'{kind.ToJsonString()}' is not a known trigger");
            return null;
        }

        if (SceneJson.String(trigger, "eventName") is { } eventName && SceneJson.IsPath(eventName))
        {
            return new EventInteractionTriggerSyntax(eventName, SourceLocation.Start);
        }

        if (SceneJson.Integer(trigger["seconds"]) is { } seconds and > 0)
        {
            return new IntervalInteractionTriggerSyntax(seconds, IntervalUnit.Seconds, SourceLocation.Start);
        }

        if (SceneJson.String(trigger, "triggerName") is { } triggerName && SceneJson.IsIdentifier(triggerName))
        {
            return new ApplicationTriggerInteractionTriggerSyntax(triggerName, SourceLocation.Start);
        }

        gaps.Member(owner + " interaction", "trigger", $"'{trigger.ToJsonString()}' is not a trigger Screenplay {ScreenplayVersion.Current} can name");
        return null;
    }

    public static JsonObject ToJson(InteractionTriggerSyntax trigger) => trigger switch
    {
        BuiltInInteractionTriggerSyntax builtIn => new() { ["kind"] = SceneEnumerations.TriggerKinds[(int)builtIn.Kind] },
        EventInteractionTriggerSyntax @event => new() { ["eventName"] = @event.EventName },
        IntervalInteractionTriggerSyntax interval => new() { ["seconds"] = interval.Amount * Seconds(interval.Unit) },
        ApplicationTriggerInteractionTriggerSyntax application => new() { ["triggerName"] = application.TriggerName },
        _ => []
    };

    static int Seconds(IntervalUnit unit) => unit switch
    {
        IntervalUnit.Minutes => 60,
        IntervalUnit.Hours => 3600,
        IntervalUnit.Days => 86400,
        _ => 1
    };
}
