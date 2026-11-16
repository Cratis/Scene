// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// The screens were put in a new order.
/// </summary>
/// <param name="Screens">The screens in their new order; screens not named keep their order after these.</param>
[EventType]
public record ScreensReordered(IReadOnlyList<string> Screens);
