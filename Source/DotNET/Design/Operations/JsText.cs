// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Writes JSON values as text the way the TypeScript package does, so that messages built from them are the same in both.
/// </summary>
internal static class JsText
{
    /// <summary>
    /// Writes a JSON value as text.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    public static string Of(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.String => value.GetString()!,
        JsonValueKind.Number => Number(value.GetDouble()),
        JsonValueKind.True => "true",
        JsonValueKind.False => "false",
        JsonValueKind.Null or JsonValueKind.Undefined => string.Empty,
        _ => value.GetRawText(),
    };

    /// <summary>
    /// Writes a number as text.
    /// </summary>
    /// <param name="value)">The value).</param>
    /// <returns>The result.</returns>
    public static string Number(double value) => value.ToString("R", CultureInfo.InvariantCulture);
}
