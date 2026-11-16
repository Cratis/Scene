// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>Changes the screen set.</summary>
/// <param name="Change">One of add, remove and move.</param>
/// <param name="Name">The screen.</param>
/// <param name="Index">The position, for a move.</param>
internal sealed record ScreenSetStep(string Change, string Name, int? Index = null) : LoweredStep;
