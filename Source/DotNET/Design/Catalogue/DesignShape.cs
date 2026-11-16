// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A data shape the host declares.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Fields">Its fields.</param>
public record DesignShape(string Name, IReadOnlyList<DesignFieldEntry> Fields);
