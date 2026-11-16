// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// A Scene edit an operation lowered to, with the scope it applied in.
/// </summary>
/// <param name="Scope">The editing scope.</param>
/// <param name="Edit">The edit.</param>
public record ScopedSceneEdit(EditingScope Scope, SceneEdit Edit);
