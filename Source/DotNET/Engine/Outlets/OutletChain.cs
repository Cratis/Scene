// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// The levels an outlet of a screen resolves through, and the levels outside them that contribute to it.
/// </summary>
/// <param name="Chain">The levels from the top down: the application, the layout, the screen template, each module and feature of the screen's path, then the screen.</param>
/// <param name="Contributors">The levels outside the chain that contribute: other screens, other modules and the host's levels not on the screen's path.</param>
public record OutletChain(IReadOnlyList<OutletLevel> Chain, IReadOnlyList<OutletLevel> Contributors);
