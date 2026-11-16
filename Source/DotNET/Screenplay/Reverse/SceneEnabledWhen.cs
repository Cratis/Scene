// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Guards;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The condition after `enabled when` (StudioIssues#1331): the text Scene stores on a hook, and the condition Screenplay carries. Scene's own reader of the text
/// decides what a condition is, so Studio never reads one differently from the engine that evaluates it; this only moves its comparisons and its and / or between
/// the two shapes.
/// </summary>
static class SceneEnabledWhen
{
    static readonly string[] _operators = ["Equal", "NotEqual", "GreaterThan", "GreaterThanOrEqual", "LessThan", "LessThanOrEqual", "Contains", "StartsWith"];

    /// <summary>
    /// The condition a hook says, or nothing when Scene cannot read the text.
    /// </summary>
    public static ConditionSyntax? ToSyntax(string text)
    {
        if (GuardConditionText.Parse(text) is not { } wire)
        {
            return null;
        }

        return Read(JsonNode.Parse(wire.GetRawText()));
    }

    /// <summary>
    /// The text of a condition, or nothing when it says something a hook cannot (a comparison against the clock, or a name that is not an item's).
    /// </summary>
    public static string? Describe(ConditionSyntax condition)
    {
        if (Write(condition) is not { } wire)
        {
            return null;
        }

        var text = GuardConditionText.Describe(JsonElement.Parse(wire.ToJsonString()));
        return GuardConditionText.Parse(text) is null ? null : text;
    }

    static ConditionSyntax? Read(JsonNode? node)
    {
        if (node is not JsonObject json)
        {
            return null;
        }

        switch (SceneJson.String(json, "kind"))
        {
            case "logical":
                if (Read(json["left"]) is not { } left
                    || Read(json["right"]) is not { } right
                    || !Enum.TryParse<LogicalOperator>(SceneJson.String(json, "operator"), true, out var logical))
                {
                    return null;
                }

                return new LogicalConditionSyntax(left, logical, right, SourceLocation.Start);
            case "comparison":
                var subject = SceneJson.String(SceneJson.Object(json, "left"), "subject");
                var comparison = Array.IndexOf(_operators, SceneJson.String(json, "operator"));
                return subject is null || comparison < 0
                    ? null
                    : new ComparisonConditionSyntax(subject, (ComparisonOperator)comparison, SceneValues.ToExpression(json["right"]), SourceLocation.Start);
            default:
                return null;
        }
    }

    static JsonObject? Write(ConditionSyntax condition)
    {
        switch (condition)
        {
            case LogicalConditionSyntax logical:
                return Write(logical.Left) is { } left && Write(logical.Right) is { } right
                    ? new JsonObject { ["kind"] = "logical", ["left"] = left, ["operator"] = logical.Operator.ToString(), ["right"] = right }
                    : null;
            case ComparisonConditionSyntax { LeftExpression: null } comparison:
                return new JsonObject
                {
                    ["kind"] = "comparison",
                    ["left"] = new JsonObject { ["subject"] = comparison.Left },
                    ["operator"] = _operators[(int)comparison.Operator],
                    ["right"] = SceneValues.ToJson(comparison.Right)
                };
            default:
                return null;
        }
    }
}
