// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Scene property values and bindings on one side, Screenplay literal expressions and UI bindings on the other.
/// </summary>
static class SceneValues
{
    static readonly string[] _bindingMembers = ["path", "kind", "query", "componentId", "componentPropertyPath", "mode", "nullBehavior", "expectedValueType", "value"];

    public static bool IsBinding(JsonNode? node) =>
        node is JsonObject json && json["path"] is JsonValue path && path.GetValueKind() == JsonValueKind.String;

    public static ExpressionSyntax ToExpression(JsonNode? node) => node switch
    {
        null => Literal(null),
        JsonArray array => new ListExpressionSyntax([.. array.Select(ToExpression)], SourceLocation.Start),
        JsonObject json => new ObjectExpressionSyntax([.. json.Select(member => new ObjectMemberSyntax(member.Key, ToExpression(member.Value), SourceLocation.Start))], SourceLocation.Start),
        JsonValue value => value.GetValueKind() switch
        {
            JsonValueKind.String => Literal(value.GetValue<string>()),
            JsonValueKind.Number => Literal(SceneJson.Number(value)),
            JsonValueKind.True => Literal(true),
            JsonValueKind.False => Literal(false),
            _ => Literal(null)
        },
        _ => Literal(null)
    };

    public static JsonNode? ToJson(ExpressionSyntax? expression) => expression switch
    {
        LiteralExpressionSyntax { Value: null } => null,
        LiteralExpressionSyntax { Value: string text } => JsonValue.Create(text),
        LiteralExpressionSyntax { Value: bool flag } => JsonValue.Create(flag),
        LiteralExpressionSyntax literal => SceneJson.FromNumber(literal.Value),
        ListExpressionSyntax list => new JsonArray([.. list.Items.Select(ToJson)]),
        ObjectExpressionSyntax json => new JsonObject(json.Members.Select(member => KeyValuePair.Create(member.Name, ToJson(member.Value)))),
        _ => null
    };

    public static UiBindingSyntax ToBinding(JsonObject value, string owner, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(value, owner, _bindingMembers);
        var kind = Index(value, "kind", SceneEnumerations.BindingKinds, owner, gaps) ?? 0;
        var bindingKind = (UiBindingKind)(kind + 1);
        if (bindingKind != UiBindingKind.Literal && value["value"] is not null)
        {
            gaps.Member(owner, "value", "only a literal binding carries a value");
        }

        var mode = Index(value, "mode", SceneEnumerations.BindingModes, owner, gaps);
        var nullBehavior = Index(value, "nullBehavior", SceneEnumerations.NullBehaviors, owner, gaps);
        return new(bindingKind, SceneJson.String(value, "path") ?? string.Empty, SourceLocation.Start)
        {
            Query = SceneJson.String(value, "query"),
            ComponentId = SceneJson.String(value, "componentId"),
            ComponentPropertyPath = SceneJson.String(value, "componentPropertyPath"),
            Mode = mode is { } modeIndex ? (UiBindingMode)modeIndex : null,
            NullBehavior = nullBehavior is { } nullIndex ? (UiBindingNullBehavior)nullIndex : null,
            ExpectedValueType = SceneJson.String(value, "expectedValueType"),
            Literal = bindingKind == UiBindingKind.Literal ? ToExpression(value["value"]) : null
        };
    }

    public static JsonObject ToJson(UiBindingSyntax binding)
    {
        var json = new JsonObject { ["path"] = binding.Path };
        if (binding.BindingKind is not (UiBindingKind.DataContext or UiBindingKind.Invalid))
        {
            json["kind"] = SceneEnumerations.BindingKinds[(int)binding.BindingKind - 1];
        }

        Optional(json, "query", binding.Query);
        Optional(json, "componentId", binding.ComponentId);
        Optional(json, "componentPropertyPath", binding.ComponentPropertyPath);
        Optional(json, "mode", binding.Mode is { } mode ? SceneEnumerations.BindingModes[(int)mode] : null);
        Optional(json, "nullBehavior", binding.NullBehavior is { } nullBehavior ? SceneEnumerations.NullBehaviors[(int)nullBehavior] : null);
        Optional(json, "expectedValueType", binding.ExpectedValueType);
        if (binding.BindingKind == UiBindingKind.Literal)
        {
            json["value"] = ToJson(binding.Literal);
        }

        return json;
    }

    /// <summary>
    /// Interaction arguments, conditions and state values are plain paths in Screenplay; a Scene binding saying more than a
    /// data-context path cannot travel there.
    /// </summary>
    public static string? ToPath(JsonNode? node, string owner, string member, SceneTransportGaps gaps)
    {
        if (node is not JsonObject json || !IsBinding(json))
        {
            gaps.Member(owner, member, "it is not a binding with a path");
            return null;
        }

        var kind = SceneJson.Index(json["kind"], SceneEnumerations.BindingKinds) ?? (json["kind"] is null ? 0 : -1);
        if (kind != 0 || json.Any(entry => entry.Key is not ("path" or "kind") && entry.Value is not null))
        {
            gaps.Member(owner, member, $"Screenplay {ScreenplayVersion.Current} carries only a data-context path there");
        }

        return SceneJson.String(json, "path");
    }

    public static JsonObject FromPath(string path) => new() { ["path"] = path };

    public static void Optional(JsonObject json, string member, string? value)
    {
        if (value is not null)
        {
            json[member] = value;
        }
    }

    static int? Index(JsonObject value, string member, string[] names, string owner, SceneTransportGaps gaps)
    {
        if (value[member] is not { } node)
        {
            return null;
        }

        var index = SceneJson.Index(node, names);
        if (index is null)
        {
            gaps.Member(owner, member, $"'{node.ToJsonString()}' is not a known value");
        }

        return index;
    }

    static LiteralExpressionSyntax Literal(object? value) => new(value, SourceLocation.Start);
}
