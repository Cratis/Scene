// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The screen or the screen template an operation applies to.
/// </summary>
/// <param name="IsScreen">Whether it is a screen; a screen template otherwise.</param>
/// <param name="Name">Its name.</param>
/// <param name="Value">It, as Scene JSON.</param>
internal sealed record ResolvedTarget(bool IsScreen, string Name, JsonObject Value);
