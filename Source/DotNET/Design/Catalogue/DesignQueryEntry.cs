// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A query a component may be bound to.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Name">Its name.</param>
/// <param name="ResultShape">What it returns: <c language="text">collection</c>, <c language="text">single</c> or <c language="text">optional-single</c>.</param>
/// <param name="Fields">The fields of its result.</param>
/// <param name="Parameters">The names of its parameters.</param>
public record DesignQueryEntry(string Id, string Name, string ResultShape, IReadOnlyList<DesignFieldEntry> Fields, IReadOnlyList<string> Parameters);
