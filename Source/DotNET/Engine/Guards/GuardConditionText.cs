// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

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
    static readonly (string Written, string Operator)[] _symbols =
    [
        ("==", "Equal"),
        ("!=", "NotEqual"),
        (">=", "GreaterThanOrEqual"),
        ("<=", "LessThanOrEqual"),
        (">", "GreaterThan"),
        ("<", "LessThan"),
    ];

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

    enum TokenType
    {
        Path = 0,
        Literal = 1,
        Operator = 2,
        Logical = 3,
        Open = 4,
        Close = 5,
    }

    /// <summary>
    /// Reads a condition.
    /// </summary>
    /// <param name="text">The condition as written.</param>
    /// <returns>The guard condition, or <see langword="null"/> when the text is not a condition Scene can read.</returns>
    public static JsonElement? Parse(string text)
    {
        var tokens = Tokenize(text);
        if (tokens is null || tokens.Count == 0) return null;
        var parser = new Parser(tokens);
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
        var kind = condition.TryGetProperty("kind", out var value) ? value.GetString() : null;
        var @operator = condition.TryGetProperty("operator", out var operatorValue) ? operatorValue.GetString() ?? string.Empty : string.Empty;
        if (kind == "comparison")
        {
            var subject = condition.GetProperty("left").GetProperty("subject").GetString();
            var right = condition.GetProperty("right");
            var literal = right.ValueKind switch
            {
                JsonValueKind.String => JsonSerializer.Serialize(right.GetString()),
                JsonValueKind.Number => right.GetDouble().ToString(CultureInfo.InvariantCulture),
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                _ => "null",
            };
            return $"{subject} {_written.GetValueOrDefault(@operator, @operator)} {literal}";
        }

        string Side(JsonElement part) =>
            @operator == "And" && part.TryGetProperty("kind", out var partKind) && partKind.GetString() == "logical"
                && part.GetProperty("operator").GetString() == "Or"
                ? $"({Describe(part)})"
                : Describe(part);
        return $"{Side(condition.GetProperty("left"))} {(@operator == "And" ? "and" : "or")} {Side(condition.GetProperty("right"))}";
    }

    static List<(TokenType Type, JsonNode? Value)>? Tokenize(string text)
    {
        var tokens = new List<(TokenType Type, JsonNode? Value)>();
        var index = 0;
        while (index < text.Length)
        {
            var character = text[index];
            if (char.IsWhiteSpace(character))
            {
                index++;
                continue;
            }

            if (character is '(' or ')')
            {
                tokens.Add((character == '(' ? TokenType.Open : TokenType.Close, null));
                index++;
                continue;
            }

            if (Starts(text, index, "&&") || Starts(text, index, "||"))
            {
                tokens.Add((TokenType.Logical, character == '&' ? "And" : "Or"));
                index += 2;
                continue;
            }

            var symbol = _symbols.FirstOrDefault(candidate => Starts(text, index, candidate.Written));
            if (symbol.Written is not null)
            {
                tokens.Add((TokenType.Operator, symbol.Operator));
                index += symbol.Written.Length;
                continue;
            }

            if (character is '"' or '\'')
            {
                var quoted = new StringBuilder();
                index++;
                while (index < text.Length && text[index] != character)
                {
                    if (text[index] == '\\' && index + 1 < text.Length) index++;
                    quoted.Append(text[index]);
                    index++;
                }

                if (index >= text.Length) return null;
                index++;
                tokens.Add((TokenType.Literal, JsonValue.Create(quoted.ToString())));
                continue;
            }

            var number = Number(text, index);
            if (number > index)
            {
                tokens.Add((TokenType.Literal, JsonValue.Create(double.Parse(text[index..number], CultureInfo.InvariantCulture))));
                index = number;
                continue;
            }

            var end = Word(text, index);
            if (end == index) return null;
            var word = text[index..end];
            tokens.Add(word.ToLowerInvariant() switch
            {
                "and" => (TokenType.Logical, "And"),
                "or" => (TokenType.Logical, "Or"),
                "contains" => (TokenType.Operator, "Contains"),
                "startswith" => (TokenType.Operator, "StartsWith"),
                "true" => (TokenType.Literal, JsonValue.Create(true)),
                "false" => (TokenType.Literal, JsonValue.Create(false)),
                "null" => (TokenType.Literal, null),
                _ => (TokenType.Path, word),
            });
            index = end;
        }

        return tokens;
    }

    static bool Starts(string text, int index, string value) => string.CompareOrdinal(text, index, value, 0, value.Length) == 0;

    static int Number(string text, int index)
    {
        var position = index;
        if (position < text.Length && text[position] == '-') position++;
        var digits = position;
        while (position < text.Length && char.IsAsciiDigit(text[position])) position++;
        if (position == digits) return index;
        if (position + 1 < text.Length && text[position] == '.' && char.IsAsciiDigit(text[position + 1]))
        {
            position++;
            while (position < text.Length && char.IsAsciiDigit(text[position])) position++;
        }

        return position;
    }

    static int Word(string text, int index)
    {
        var position = index;
        while (true)
        {
            if (position >= text.Length || !(char.IsAsciiLetter(text[position]) || text[position] == '_')) return position;
            position++;
            while (position < text.Length && (char.IsAsciiLetterOrDigit(text[position]) || text[position] == '_')) position++;
            if (position + 1 < text.Length && text[position] == '.' && (char.IsAsciiLetter(text[position + 1]) || text[position + 1] == '_'))
            {
                position++;
                continue;
            }

            return position;
        }
    }

    sealed class Parser(List<(TokenType Type, JsonNode? Value)> tokens)
    {
        int _position;

        public bool Done => _position == tokens.Count;

        public JsonObject? Or() => Chain("Or", And);

        JsonObject? And() => Chain("And", Operand);

        JsonObject? Chain(string @operator, Func<JsonObject?> next)
        {
            var left = next();
            while (left is not null && _position < tokens.Count && tokens[_position].Type == TokenType.Logical && tokens[_position].Value!.GetValue<string>() == @operator)
            {
                _position++;
                var right = next();
                if (right is null) return null;
                left = new JsonObject { ["kind"] = "logical", ["left"] = left, ["operator"] = @operator, ["right"] = right };
            }

            return left;
        }

        JsonObject? Operand()
        {
            if (_position < tokens.Count && tokens[_position].Type == TokenType.Open)
            {
                _position++;
                var inner = Or();
                if (_position >= tokens.Count || tokens[_position].Type != TokenType.Close) return null;
                _position++;
                return inner;
            }

            if (_position + 2 >= tokens.Count) return null;
            var (subjectType, subject) = tokens[_position];
            var (operatorType, @operator) = tokens[_position + 1];
            var (valueType, value) = tokens[_position + 2];
            if (subjectType != TokenType.Path || !subject!.GetValue<string>().StartsWith("item.", StringComparison.Ordinal) || operatorType != TokenType.Operator || valueType != TokenType.Literal)
            {
                return null;
            }

            _position += 3;
            return new JsonObject
            {
                ["kind"] = "comparison",
                ["left"] = new JsonObject { ["subject"] = subject.GetValue<string>() },
                ["operator"] = @operator!.GetValue<string>(),
                ["right"] = value?.DeepClone(),
            };
        }
    }
}
