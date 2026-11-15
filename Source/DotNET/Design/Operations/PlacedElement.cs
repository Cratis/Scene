// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// An element found in the content of a target, and the outlet whose content holds it.
/// </summary>
/// <param name="Element">The element, as Scene JSON.</param>
/// <param name="Outlet">The outlet.</param>
internal sealed record PlacedElement(JsonObject Element, string Outlet);
