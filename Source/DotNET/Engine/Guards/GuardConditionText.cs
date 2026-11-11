// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json;

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// Reads a condition as Screenplay writes it after <c language="screenplay">enabled when</c>, such as
/// <c language="screenplay">item.status == "onSale" and item.stock &gt; 0</c>, into the guard condition Scene evaluates, and writes
/// one back. A comparison is an <c language="screenplay">item.</c> path, an operator (<c language="screenplay">==</c>,
/// <c language="screenplay">!=</c>, <c language="screenplay">&gt;</c>, <c language="screenplay">&gt;=</c>, <c language="screenplay">&lt;</c>,
/// <c language="screenplay">&lt;=</c>, <c language="screenplay">contains</c> or <c language="screenplay">startsWith</c>) and a literal (a
/// quoted text, a number, <c language="screenplay">true</c>, <c language="screenplay">false</c> or <c language="screenplay">null</c>);
/// comparisons join with <c language="screenplay">and</c> (<c language="screenplay">&amp;&amp;</c>), which binds tighter than
/// <c language="screenplay">or</c> (<c language="screenplay">||</c>), and group in parentheses. The TypeScript engine's
/// <c language="typescript">parseGuardCondition</c> reads the same text; both are asserted against <c language="json">placement-fixtures.json</c>.
/// </summary>
public static class GuardConditionText
{
    static readonly Dictionary<string, string> _written = new(StringComparer.Ordinal)
    {
        ["Equal"] = "==",
        ["NotEqual"] = "!=",
        ["GreaterThan"] = ">",
        ["GreaterThanOrEqual"] = ">=",
        ["LessThan"] = "<",
        ["LessThanOrEqual"] = "<=",
        ["Contains"] = "contains",
        ["StartsWith"] = "startsWith",
    };

    /// <summary>
    /// Reads a condition.
    /// </summary>
    /// <param name="text">The condition as written.</param>
    /// <returns>The guard condition, or <see langword="null"/> when the text is not a condition Scene can read.</returns>
    public static JsonElement? Parse(string text)
    {
        var tokens = GuardConditionTokenizer.Tokenize(text);
        if (tokens is null || tokens.Count == 0) return null;
        var parser = new GuardConditionParser(tokens);
        var condition = parser.Or();
        return condition is not null && parser.Done ? JsonSerializer.SerializeToElement(condition) : null;
    }

    /// <summary>
    /// Writes a guard condition the way Screenplay writes it after <c language="screenplay">enabled when</c>.
    /// </summary>
    /// <param name="condition">The condition.</param>
    /// <returns>The condition as text.</returns>
    public static string Describe(JsonElement condition)
    {
        var kind = StringProperty(condition, "kind");
        var @operator = StringProperty(condition, "operator") ?? string.Empty;
        return kind == "comparison" ? DescribeComparison(condition, @operator) : DescribeLogical(condition, @operator);
    }

    static string? StringProperty(JsonElement element, string name) => element.TryGetProperty(name, out var value) ? value.GetString() : null;

    static string DescribeComparison(JsonElement condition, string @operator)
    {
        var subject = condition.GetProperty("left").GetProperty("subject").GetString();
        var literal = DescribeLiteral(condition.GetProperty("right"));
        return $"{subject} {_written.GetValueOrDefault(@operator, @operator)} {literal}";
    }

    static string DescribeLiteral(JsonElement literal) => literal.ValueKind switch
    {
        JsonValueKind.String => JsonSerializer.Serialize(literal.GetString()),
        JsonValueKind.Number => literal.GetDouble().ToString(CultureInfo.InvariantCulture),
        JsonValueKind.True => "true",
        JsonValueKind.False => "false",
        _ => "null",
    };

    static string DescribeLogical(JsonElement condition, string @operator)
    {
        var isAnd = @operator == "And";
        string Side(JsonElement part) => isAnd && IsOr(part) ? $"({Describe(part)})" : Describe(part);
        return $"{Side(condition.GetProperty("left"))} {(isAnd ? "and" : "or")} {Side(condition.GetProperty("right"))}";
    }

    static bool IsOr(JsonElement part) =>
        StringProperty(part, "kind") == "logical" && part.GetProperty("operator").GetString() == "Or";
}
