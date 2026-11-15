// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Design.Operations;

/// <summary>Declares a screen in the document.</summary>
/// <param name="Screen">The screen, as Scene JSON.</param>
internal sealed record DeclareScreenStep(JsonObject Screen) : LoweredStep;
