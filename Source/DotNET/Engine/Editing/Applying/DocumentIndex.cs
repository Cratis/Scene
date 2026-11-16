// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Every addressable node of a document, by id, with the problems found while indexing.
/// </summary>
sealed class DocumentIndex
{
    /// <summary>
    /// Gets the nodes by id.
    /// </summary>
    public Dictionary<string, NodeRecord> Nodes { get; } = [with(StringComparer.Ordinal)];

    /// <summary>
    /// Gets the problems found while indexing.
    /// </summary>
    public List<SceneDiagnostic> Diagnostics { get; } = [];
}
