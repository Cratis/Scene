// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// Reads the tokens of a guard condition into the condition, with <c language="screenplay">and</c> binding tighter than
/// <c language="screenplay">or</c>.
/// </summary>
/// <param name="tokens">The tokens of the condition.</param>
sealed class GuardConditionParser(List<GuardToken> tokens)
{
    int _position;

    /// <summary>
    /// Gets a value indicating whether every token has been read.
    /// </summary>
    public bool Done => _position == tokens.Count;

    /// <summary>
    /// Reads comparisons joined with or.
    /// </summary>
    /// <returns>The condition, or <see langword="null"/> when the tokens do not read as one.</returns>
    public JsonObject? Or() => Chain("Or", And);

    JsonObject? And() => Chain("And", Operand);

    GuardToken? At(int offset) => _position + offset < tokens.Count ? tokens[_position + offset] : null;

    bool AtLogical(string logical) => At(0) is { Type: GuardTokenType.Logical } token && token.Text == logical;

    JsonObject? Chain(string logical, Func<JsonObject?> next)
    {
        var left = next();
        while (left is not null && AtLogical(logical))
        {
            _position++;
            var right = next();
            if (right is null) return null;
            left = new JsonObject { ["kind"] = "logical", ["left"] = left, ["operator"] = logical, ["right"] = right };
        }

        return left;
    }

    JsonObject? Operand() => At(0) is { Type: GuardTokenType.Open } ? Group() : Comparison();

    JsonObject? Group()
    {
        _position++;
        var inner = Or();
        if (At(0) is not { Type: GuardTokenType.Close }) return null;
        _position++;
        return inner;
    }

    JsonObject? Comparison()
    {
        if (At(0) is not { Type: GuardTokenType.Path } subject || !subject.Text.StartsWith("item.", StringComparison.Ordinal)) return null;
        if (At(1) is not { Type: GuardTokenType.Operator } comparison || At(2) is not { Type: GuardTokenType.Literal } value) return null;
        _position += 3;
        return new JsonObject
        {
            ["kind"] = "comparison",
            ["left"] = new JsonObject { ["subject"] = subject.Text },
            ["operator"] = comparison.Text,
            ["right"] = value.Value?.DeepClone(),
        };
    }
}
