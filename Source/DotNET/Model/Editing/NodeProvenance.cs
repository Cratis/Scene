// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Where a node comes from, relative to the editing scope.
/// </summary>
/// <param name="Kind">Whether the scope owns the node.</param>
/// <param name="Source">The owner it comes from, when it is not local.</param>
public record NodeProvenance(
    ProvenanceKind Kind,
    string? Source = null);
