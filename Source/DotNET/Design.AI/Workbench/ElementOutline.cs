// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// An element of a screen as a design operation addresses it.
/// </summary>
/// <param name="Id">The element's stable id: what operations and comments name it by.</param>
/// <param name="Component">The component.</param>
/// <param name="Outlet">The outlet of the screen it is in.</param>
/// <param name="Within">Where it sits inside another element, when it does: the id and slot of its parent.</param>
/// <param name="Properties">The properties it has.</param>
internal sealed record ElementOutline(string Id, string Component, string Outlet, string? Within, JsonObject Properties);
