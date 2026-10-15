// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// What is being asked for: rows for a read model or shape.
/// </summary>
/// <param name="Target">The read model or shape name; defaults to the shape's name when only a shape is given.</param>
/// <param name="Shape">The shape of one row; needed for the generated rung to produce anything.</param>
public record SampleDataRequest(string? Target = null, SampleShape? Shape = null);
