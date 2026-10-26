// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Bindings;

/// <summary>A producer-supplied structural JSON value type.</summary>
/// <param name="Kind">The string, number, boolean, object or array category.</param>
/// <param name="Properties">The named properties of an object.</param>
/// <param name="Item">The element type of an array.</param>
/// <param name="Nullable">Whether a present value may be null.</param>
public record ResponseValueType(string Kind, IReadOnlyDictionary<string, ResponseValueType>? Properties = null, ResponseValueType? Item = null, bool Nullable = false);
