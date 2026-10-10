// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// The result of resolving a binding: absent (TypeScript <c language="csharp">undefined</c>), null, or a JSON value.
/// </summary>
/// <param name="IsAbsent">Whether nothing was found.</param>
/// <param name="Node">The value when present; <see langword="null"/> for a present null.</param>
public readonly record struct BindingValue(bool IsAbsent, JsonNode? Node)
{
    /// <summary>Gets the absent value.</summary>
    public static BindingValue Absent { get; } = new(true, null);

    /// <summary>Gets a present null value.</summary>
    public static BindingValue Null { get; } = new(false, null);

    /// <summary>Gets whether the value is absent or null.</summary>
    public bool IsNullOrAbsent => IsAbsent || Node is null;

    /// <summary>
    /// Creates a present value.
    /// </summary>
    /// <param name="node">The JSON value, or <see langword="null"/> for a present null.</param>
    /// <returns>The value.</returns>
    public static BindingValue Of(JsonNode? node) => new(false, node);
}
