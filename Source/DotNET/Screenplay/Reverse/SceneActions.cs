// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

static class SceneActions
{
    const string StringsPrefix = "$strings.";

    static readonly string[] _members =
        ["kind", "arguments", "onSuccess", "onFailure", "onResult", "command", "screen", "dialogTemplate", "query", "target", "value", "level", "message", "trigger"];

    public static InteractionActionSyntax? ToSyntax(JsonObject action, string owner, SceneScreenNames names, SceneTransportGaps gaps)
    {
        var scope = owner + " action";
        gaps.UnknownMembers(action, scope, _members);
        var kind = SceneJson.Index(action["kind"], SceneEnumerations.ActionKinds);
        var syntax = kind switch
        {
            0 => Named(action, "command", scope, gaps, value => new ExecuteCommandActionSyntax(value, SourceLocation.Start)),
            1 => Named(action, "screen", scope, gaps, value => new NavigateActionSyntax(names.ToScreenplay(value), SourceLocation.Start)),
            2 => new NavigateBackActionSyntax(SourceLocation.Start),
            3 => Named(action, "dialogTemplate", scope, gaps, value => new OpenDialogActionSyntax(value, SourceLocation.Start)),
            4 => new CloseDialogActionSyntax(SourceLocation.Start),
            5 => Named(action, "query", scope, gaps, value => new RefreshQueryActionSyntax(value, SourceLocation.Start)),
            6 => SetState(action, scope, gaps),
            7 => Message(action, scope, gaps) is { } notify
                ? new NotifyActionSyntax((NotificationLevel)(SceneJson.Index(action["level"], SceneEnumerations.NotificationLevels) ?? 0), notify.Text, SourceLocation.Start) { MessageIsLiteral = notify.IsLiteral }
                : null,
            8 => Message(action, scope, gaps) is { } confirm
                ? new ConfirmActionSyntax(confirm.Text, SourceLocation.Start) { MessageIsLiteral = confirm.IsLiteral }
                : null,
            9 => Named(action, "trigger", scope, gaps, value => new RaiseTriggerActionSyntax(value, SourceLocation.Start)),
            _ => Unknown(action, scope, gaps)
        };

        if (syntax is null)
        {
            return null;
        }

        if (kind != 3 && !SceneJson.IsEmpty(action["onResult"]))
        {
            gaps.Member(scope, "onResult", $"Screenplay {ScreenplayVersion.Current} allows 'on result' only on 'open dialog'");
        }

        return syntax with
        {
            Arguments = [.. SceneJson.Array(action, "arguments").OfType<JsonObject>().Select(argument => Argument(argument, scope, gaps)).OfType<InteractionArgumentSyntax>()],
            OnSuccess = Nested(action, "onSuccess", owner, names, gaps),
            OnFailure = Nested(action, "onFailure", owner, names, gaps),
            OnResult = kind == 3 ? Nested(action, "onResult", owner, names, gaps) : []
        };
    }

    public static JsonObject ToJson(InteractionActionSyntax action, SceneScreenNames names)
    {
        var json = action switch
        {
            ExecuteCommandActionSyntax execute => Kind(0, "command", execute.Command),
            NavigateActionSyntax navigate => Kind(1, "screen", names.ToScene(navigate.Screen)),
            NavigateBackActionSyntax => Kind(2),
            OpenDialogActionSyntax dialog => Kind(3, "dialogTemplate", dialog.DialogTemplate),
            CloseDialogActionSyntax => Kind(4),
            RefreshQueryActionSyntax refresh => Kind(5, "query", refresh.Query),
            SetStateActionSyntax state => With(Kind(6, "target", state.Target), "value", SceneValues.FromPath(state.Value)),
            NotifyActionSyntax notify => With(
                With(Kind(7), "level", SceneEnumerations.NotificationLevels[Math.Max(0, (int)notify.Level)]),
                "message",
                MessageJson(notify.Message, notify.MessageIsLiteral)),
            ConfirmActionSyntax confirm => With(Kind(8), "message", MessageJson(confirm.Message, confirm.MessageIsLiteral)),
            RaiseTriggerActionSyntax raise => Kind(9, "trigger", raise.Trigger),
            _ => []
        };

        Collection(json, "arguments", action.Arguments.Select(argument => (JsonNode)new JsonObject { ["name"] = argument.Name, ["value"] = SceneValues.FromPath(argument.Binding) }));
        Collection(json, "onSuccess", action.OnSuccess.Select(nested => (JsonNode)ToJson(nested, names)));
        Collection(json, "onFailure", action.OnFailure.Select(nested => (JsonNode)ToJson(nested, names)));
        Collection(json, "onResult", action.OnResult.Select(nested => (JsonNode)ToJson(nested, names)));
        return json;
    }

    static InteractionActionSyntax? Named(JsonObject action, string member, string scope, SceneTransportGaps gaps, Func<string, InteractionActionSyntax> create)
    {
        if (SceneJson.String(action, member) is { } value && SceneJson.IsPath(value))
        {
            return create(value);
        }

        gaps.Member(scope, member, $"it is not a name Screenplay {ScreenplayVersion.Current} can reference");
        return null;
    }

    static InteractionActionSyntax? SetState(JsonObject action, string scope, SceneTransportGaps gaps) =>
        SceneJson.String(action, "target") is { } target && SceneJson.IsPath(target) && SceneValues.ToPath(action["value"], scope, "value", gaps) is { } value
            ? new SetStateActionSyntax(target, value, SourceLocation.Start)
            : Missing(scope, "target", gaps);

    static (string Text, bool IsLiteral)? Message(JsonObject action, string scope, SceneTransportGaps gaps)
    {
        if (action["message"] is not JsonObject message)
        {
            gaps.Member(scope, "message", "it is missing");
            return null;
        }

        gaps.UnknownMembers(message, scope + " message", ["text", "stringsKey", "binding"]);
        if (message.Count(member => member.Value is not null) != 1)
        {
            gaps.Member(scope, "message", $"Screenplay {ScreenplayVersion.Current} carries exactly one of text, strings key or binding");
        }

        if (SceneJson.String(message, "text") is { } text)
        {
            return (text, true);
        }

        if (SceneJson.String(message, "stringsKey") is { } key)
        {
            return (StringsPrefix + key, false);
        }

        return SceneValues.ToPath(message["binding"], scope, "message", gaps) is { } path ? (path, false) : null;
    }

    static JsonObject MessageJson(string message, bool isLiteral)
    {
        if (isLiteral)
        {
            return new() { ["text"] = message };
        }

        return message.StartsWith(StringsPrefix, StringComparison.Ordinal)
            ? new() { ["stringsKey"] = message[StringsPrefix.Length..] }
            : new() { ["binding"] = SceneValues.FromPath(message) };
    }

    static InteractionArgumentSyntax? Argument(JsonObject argument, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(argument, scope + " argument", ["name", "value"]);
        return SceneJson.String(argument, "name") is { } name && SceneJson.IsIdentifier(name) && SceneValues.ToPath(argument["value"], scope, "argument " + name, gaps) is { } path
            ? new InteractionArgumentSyntax(name, path, SourceLocation.Start)
            : Missing<InteractionArgumentSyntax>(scope, "arguments", gaps);
    }

    static IEnumerable<InteractionActionSyntax> Nested(JsonObject action, string member, string owner, SceneScreenNames names, SceneTransportGaps gaps) =>
        [.. SceneJson.Array(action, member).OfType<JsonObject>().Select(nested => ToSyntax(nested, owner, names, gaps)).OfType<InteractionActionSyntax>()];

    static InteractionActionSyntax? Unknown(JsonObject action, string scope, SceneTransportGaps gaps)
    {
        gaps.Member(scope, "kind", $"'{action["kind$"]?.ToJsonString()}' is not an action Screenplay {ScreenplayVersion.Current} knows");
        return null;
    }

    static InteractionActionSyntax? Missing(string scope, string member, SceneTransportGaps gaps) => Missing<InteractionActionSyntax>(scope, member, gaps);

    static T? Missing<T>(string scope, string member, SceneTransportGaps gaps)
        where T : class
    {
        gaps.Member(scope, member, $"it is not a name or path Screenplay {ScreenplayVersion.Current} can reference");
        return null;
    }

    static JsonObject Kind(int kind, string? member = null, string? value = null)
    {
        var json = new JsonObject { ["kind"] = SceneEnumerations.ActionKinds[kind] };
        return member is null ? json : With(json, member, value);
    }

    static JsonObject With(JsonObject json, string member, JsonNode? value)
    {
        json[member] = value;
        return json;
    }

    static void Collection(JsonObject json, string member, IEnumerable<JsonNode> items)
    {
        var array = new JsonArray([.. items]);
        if (array.Count > 0)
        {
            json[member] = array;
        }
    }
}
