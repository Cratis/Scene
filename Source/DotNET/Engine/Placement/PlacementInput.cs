// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// One input of the command a slice submits, and where it gets its value when the action runs.
/// </summary>
/// <param name="Name">The name of the input, such as <c language="csharp">price</c>.</param>
/// <param name="Source">Where the input's value comes from; <see langword="null"/> when nothing feeds it, so only a form can ask for it.</param>
public record PlacementInput(string Name, InputSourceKind? Source = null);
