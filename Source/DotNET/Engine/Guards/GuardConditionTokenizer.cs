// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text;
using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// Splits the text of a guard condition into tokens.
/// </summary>
/// <param name="text">The condition as written.</param>
sealed class GuardConditionTokenizer(string text)
{
    /// <summary>
    /// The symbolic operators; longer symbols come first so that ">=" is read before ">".
    /// </summary>
    static readonly (string Written, string Operator)[] _symbols =
    [
        ("==", "Equal"),
        ("!=", "NotEqual"),
        (">=", "GreaterThanOrEqual"),
        ("<=", "LessThanOrEqual"),
        (">", "GreaterThan"),
        ("<", "LessThan"),
    ];

    /// <summary>
    /// The words that are not paths, by their lower-case spelling.
    /// </summary>
    static readonly Dictionary<string, GuardToken> _words = new(StringComparer.Ordinal)
    {
        ["and"] = GuardToken.Logical("And"),
        ["or"] = GuardToken.Logical("Or"),
        ["contains"] = GuardToken.Comparison("Contains"),
        ["startswith"] = GuardToken.Comparison("StartsWith"),
        ["true"] = GuardToken.Literal(JsonValue.Create(true)),
        ["false"] = GuardToken.Literal(JsonValue.Create(false)),
        ["null"] = GuardToken.Literal(null),
    };

    int _index;

    /// <summary>
    /// Splits a condition into tokens.
    /// </summary>
    /// <param name="text">The condition as written.</param>
    /// <returns>The tokens, or <see langword="null"/> when some of the text is not a token.</returns>
    public static List<GuardToken>? Tokenize(string text) => new GuardConditionTokenizer(text).ReadAll();

    static bool IsWordStart(char character) => char.IsAsciiLetter(character) || character == '_';

    static bool IsWordCharacter(char character) => char.IsAsciiLetterOrDigit(character) || character == '_';

    List<GuardToken>? ReadAll()
    {
        var tokens = new List<GuardToken>();
        while (_index < text.Length)
        {
            if (char.IsWhiteSpace(text[_index]))
            {
                _index++;
                continue;
            }

            var token = ReadToken();
            if (token is null) return null;
            tokens.Add(token.Value);
        }

        return tokens;
    }

    GuardToken? ReadToken() =>
        ReadParenthesis()
        ?? ReadLogicalSymbol()
        ?? ReadOperatorSymbol()
        ?? ReadQuotedText()
        ?? ReadNumber()
        ?? ReadWord();

    GuardToken? ReadParenthesis()
    {
        var character = text[_index];
        if (character is not ('(' or ')')) return null;
        _index++;
        return GuardToken.Parenthesis(character == '(');
    }

    GuardToken? ReadLogicalSymbol()
    {
        if (!StartsWith("&&") && !StartsWith("||")) return null;
        var token = GuardToken.Logical(text[_index] == '&' ? "And" : "Or");
        _index += 2;
        return token;
    }

    GuardToken? ReadOperatorSymbol()
    {
        var symbol = _symbols.FirstOrDefault(candidate => StartsWith(candidate.Written));
        if (symbol.Written is null) return null;
        _index += symbol.Written.Length;
        return GuardToken.Comparison(symbol.Operator);
    }

    GuardToken? ReadQuotedText()
    {
        var quote = text[_index];
        if (quote is not ('"' or '\'')) return null;
        var quoted = new StringBuilder();
        var position = _index + 1;
        while (position < text.Length && text[position] != quote)
        {
            if (text[position] == '\\' && position + 1 < text.Length) position++;
            quoted.Append(text[position]);
            position++;
        }

        if (position >= text.Length) return null;
        _index = position + 1;
        return GuardToken.Literal(JsonValue.Create(quoted.ToString()));
    }

    GuardToken? ReadNumber()
    {
        var end = NumberEnd();
        if (end == _index) return null;
        var value = double.Parse(text[_index..end], CultureInfo.InvariantCulture);
        _index = end;
        return GuardToken.Literal(JsonValue.Create(value));
    }

    GuardToken? ReadWord()
    {
        var end = WordEnd();
        if (end == _index) return null;
        var word = text[_index..end];
        _index = end;
        return _words.GetValueOrDefault(word.ToLowerInvariant(), GuardToken.Path(word));
    }

    bool StartsWith(string value) => string.CompareOrdinal(text, _index, value, 0, value.Length) == 0;

    int NumberEnd()
    {
        var position = _index;
        if (position < text.Length && text[position] == '-') position++;
        var digits = position;
        position = SkipDigits(position);
        if (position == digits) return _index;
        return IsDotBefore(position, char.IsAsciiDigit) ? SkipDigits(position + 1) : position;
    }

    int SkipDigits(int position)
    {
        while (position < text.Length && char.IsAsciiDigit(text[position])) position++;
        return position;
    }

    int WordEnd()
    {
        var position = _index;
        while (position < text.Length && IsWordStart(text[position]))
        {
            position = SkipWordCharacters(position + 1);
            if (!IsDotBefore(position, IsWordStart)) break;
            position++;
        }

        return position;
    }

    int SkipWordCharacters(int position)
    {
        while (position < text.Length && IsWordCharacter(text[position])) position++;
        return position;
    }

    bool IsDotBefore(int position, Func<char, bool> isNext) =>
        position + 1 < text.Length && text[position] == '.' && isNext(text[position + 1]);
}
