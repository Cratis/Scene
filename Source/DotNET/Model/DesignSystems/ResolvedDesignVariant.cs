// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A variant with its parts, and the parts of each of its states, resolved to values.
/// </summary>
/// <param name="Name">The variant's name.</param>
/// <param name="Parts">The resolved value of each part of the variant.</param>
/// <param name="States">Per state, the resolved value of each part the state overrides merged over the variant's parts, or <see langword="null"/> for a variant with no state.</param>
public record ResolvedDesignVariant(
    string Name,
    IReadOnlyDictionary<string, string> Parts,
    IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>? States = null);
