// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The navigation a module declares: how it treats the application's outlets (<c language="csharp">inherits</c>,
/// <c language="csharp">extends</c> or <c language="csharp">overrides</c>, with <c language="csharp">hide</c> and
/// <c language="csharp">before</c>/<c language="csharp">after</c>) and the items it contributes to them. An outlet the module does not refine
/// is inherited.
/// </summary>
/// <param name="Module">The module identity.</param>
/// <param name="Refinements">How the module treats the outlets it inherits from the application.</param>
/// <param name="Contributions">The items the module contributes to outlets (<c language="csharp">contribute to &lt;outlet&gt;</c>).</param>
public record ModuleNavigation(string Module, IReadOnlyList<OutletRefinement>? Refinements = null, IReadOnlyList<OutletContribution>? Contributions = null);
