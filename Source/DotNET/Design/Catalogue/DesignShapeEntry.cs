// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A data shape a screen may show.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Source">Where it comes from.</param>
/// <param name="Fields">Its fields.</param>
public record DesignShapeEntry(string Name, DesignShapeSource Source, IReadOnlyList<DesignFieldEntry> Fields);
