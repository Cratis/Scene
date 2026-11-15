// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.Operations;

/// <summary>A Scene edit, applied through the engine.</summary>
/// <param name="Scope">The editing scope.</param>
/// <param name="Edit">The edit.</param>
internal sealed record SceneEditStep(EditingScope Scope, SceneEdit Edit) : LoweredStep;
