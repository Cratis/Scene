// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// What a reference editor offers.
/// </summary>
/// <param name="Target">What is referenced.</param>
/// <param name="Kinds">The kinds offered.</param>
/// <param name="Predicate">A named predicate narrowing the choices.</param>
public record ReferenceFilterDescriptor(
    string Target,
    IReadOnlyList<string>? Kinds = null,
    string? Predicate = null);
