// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A field of a shape or a query result.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Type">Its type.</param>
public record DesignFieldEntry(string Name, string? Type = null);
