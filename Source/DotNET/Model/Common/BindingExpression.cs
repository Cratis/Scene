// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// A typed reference to a value resolved by the shared Scene runtime.
/// </summary>
/// <param name="Path">The path inside the selected source.</param>
/// <param name="Kind">Source kind; null means <see cref="BindingSourceKind.DataContext"/> for backward compatibility.</param>
/// <param name="Query">The named query binding when <paramref name="Kind"/> is <see cref="BindingSourceKind.QueryResult"/>.</param>
/// <param name="ComponentId">Stable component identity when <paramref name="Kind"/> is <see cref="BindingSourceKind.ComponentProperty"/>.</param>
/// <param name="ComponentPropertyPath">Property path on the source component when it differs from <paramref name="Path"/>.</param>
/// <param name="Mode">Update mode requested by the author.</param>
/// <param name="NullBehavior">How null or undefined source values affect the target.</param>
/// <param name="ExpectedValueType">Optional expected target/source value type for validation.</param>
/// <param name="Value">Literal value when <paramref name="Kind"/> is <see cref="BindingSourceKind.Literal"/>.</param>
public record BindingExpression(
    string Path,
    BindingSourceKind? Kind = null,
    string? Query = null,
    string? ComponentId = null,
    string? ComponentPropertyPath = null,
    BindingMode? Mode = null,
    BindingNullBehavior? NullBehavior = null,
    string? ExpectedValueType = null,
    object? Value = null);
