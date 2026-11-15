// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The words an enumeration value goes by on the wire, as the TypeScript model writes them.
/// </summary>
internal static class SceneWords
{
    /// <summary>
    /// Writes an enumeration value as the word it goes by on the wire.
    /// </summary>
    /// <typeparam name="T">The type.</typeparam>
    /// <param name="value">The value.</param>
    /// <returns>The word.</returns>
    public static string Of<T>(T value)
        where T : struct, Enum => JsonSerializer.SerializeToNode(value, SceneJson.Options)!.GetValue<string>();
}
