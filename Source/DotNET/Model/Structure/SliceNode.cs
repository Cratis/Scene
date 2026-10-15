// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Structure;

/// <summary>
/// A slice in the application hierarchy.
/// </summary>
/// <param name="Id">The slice identity, unique among the siblings of its feature or module; its qualified form is <c language="csharp">module.feature.Slice</c>.</param>
/// <param name="Name">The display name.</param>
/// <param name="Kind">Whether the slice is a state change, a state view or an automation.</param>
public record SliceNode(string Id, string Name, SliceKind Kind);
