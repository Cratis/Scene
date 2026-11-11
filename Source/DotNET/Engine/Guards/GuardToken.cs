// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// A piece of a guard condition's text.
/// </summary>
/// <param name="Type">What the token is.</param>
/// <param name="Value">The token's value, when it has one.</param>
readonly record struct GuardToken(GuardTokenType Type, JsonNode? Value)
{
    /// <summary>
    /// Gets the token's value as text.
    /// </summary>
    public string Text => Value!.GetValue<string>();

    /// <summary>
    /// Creates an opening or closing parenthesis.
    /// </summary>
    /// <param name="open">Whether it opens a group.</param>
    /// <returns>The token.</returns>
    public static GuardToken Parenthesis(bool open) => new(open ? GuardTokenType.Open : GuardTokenType.Close, null);

    /// <summary>
    /// Creates a logical joining token.
    /// </summary>
    /// <param name="logical">The logical operator in wire casing.</param>
    /// <returns>The token.</returns>
    public static GuardToken Logical(string logical) => new(GuardTokenType.Logical, logical);

    /// <summary>
    /// Creates a comparison operator token.
    /// </summary>
    /// <param name="comparison">The comparison operator in wire casing.</param>
    /// <returns>The token.</returns>
    public static GuardToken Comparison(string comparison) => new(GuardTokenType.Operator, comparison);

    /// <summary>
    /// Creates a literal token.
    /// </summary>
    /// <param name="value">The literal value.</param>
    /// <returns>The token.</returns>
    public static GuardToken Literal(JsonNode? value) => new(GuardTokenType.Literal, value);

    /// <summary>
    /// Creates a path token.
    /// </summary>
    /// <param name="path">The path as written.</param>
    /// <returns>The token.</returns>
    public static GuardToken Path(string path) => new(GuardTokenType.Path, path);
}
