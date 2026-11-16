// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// The copies of a freeform element, one per size-class variant, which an edit is applied to together.
/// </summary>
/// <param name="Prefix">The path of the copy a record describes.</param>
sealed record Mirror(DocumentPath Prefix)
{
    /// <summary>
    /// Gets the paths of the other copies.
    /// </summary>
    public List<DocumentPath> Others { get; } = [];
}
