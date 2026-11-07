// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// One level of the chain an outlet resolves through - a layout, template, module, feature, slice or screen - with what it
/// says about outlets.
/// </summary>
/// <param name="Kind">Where in the chain the level sits.</param>
/// <param name="Name">The name editors show for the level, such as <c language="screenplay">Catalog</c>; it is what provenance and summaries name.</param>
/// <param name="Outlets">The outlets the level declares, with their defaults.</param>
/// <param name="Refinements">How the level treats outlets it inherits.</param>
/// <param name="Contributions">The items the level contributes to outlets.</param>
public record OutletLevel(
    OutletLevelKind Kind,
    string Name,
    IReadOnlyList<Outlet>? Outlets = null,
    IReadOnlyList<OutletRefinement>? Refinements = null,
    IReadOnlyList<OutletContribution>? Contributions = null);
