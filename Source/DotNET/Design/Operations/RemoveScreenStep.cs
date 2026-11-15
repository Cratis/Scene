// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>Removes a screen from the document.</summary>
/// <param name="Name">The screen.</param>
internal sealed record RemoveScreenStep(string Name) : LoweredStep;
