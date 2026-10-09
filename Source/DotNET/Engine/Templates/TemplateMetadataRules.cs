// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Plain string rules for template metadata values, matching the TypeScript engine exactly.
/// </summary>
public static class TemplateMetadataRules
{
    const string HttpsPrefix = "https://";
    static readonly string[] _operators = ["AND", "OR", "WITH"];

    /// <summary>
    /// Whether a value is an absolute <c language="csharp">https</c> URL with a host.
    /// </summary>
    /// <param name="value">The value to check.</param>
    /// <returns><see langword="true"/> for an absolute https URL.</returns>
    public static bool IsAbsoluteHttpsUrl(string value) =>
        value.StartsWith(HttpsPrefix, StringComparison.Ordinal) &&
        value.Length > HttpsPrefix.Length &&
        value[HttpsPrefix.Length] != '/' &&
        !value.Any(char.IsWhiteSpace);

    /// <summary>
    /// Whether a value is a simple SPDX license expression: identifiers optionally joined by AND, OR or WITH.
    /// </summary>
    /// <param name="value">The value to check.</param>
    /// <returns><see langword="true"/> for a well-formed expression.</returns>
    public static bool IsSpdxExpression(string value)
    {
        var tokens = value.Split(' ');
        return tokens.Length % 2 == 1 && tokens.Select((token, index) => index % 2 == 1 ? _operators.Contains(token, StringComparer.Ordinal) : IsSpdxIdentifier(token)).All(valid => valid);
    }

    static bool IsSpdxIdentifier(string token) =>
        token.Length > 0 && token.All(character => char.IsAsciiLetterOrDigit(character) || character is '.' or '+' or '-');
}
