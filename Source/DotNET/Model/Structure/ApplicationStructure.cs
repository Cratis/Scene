// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Structure;

/// <summary>
/// A read-only description of which modules, features and slices an application has, and what kind each slice is.
/// It is a reference input supplied by the host (Stage's converter, Studio); it is not persisted in a scene document.
/// Ids are the dotted qualified ids already used by <see cref="Common.DestinationReference"/>, for example <c language="csharp">sales.orders.PlaceOrder</c>.
/// </summary>
/// <param name="Modules">The modules of the application, in declaration order.</param>
public record ApplicationStructure(IReadOnlyList<ModuleNode> Modules);
