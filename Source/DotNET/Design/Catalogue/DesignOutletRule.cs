// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// What one outlet - a slot of a screen template - takes.
/// </summary>
/// <param name="Name">The outlet's name.</param>
/// <param name="Components">Components named by the template's own content for the outlet, or by the host's rule.</param>
/// <param name="Categories">Categories the outlet takes.</param>
/// <param name="Open">Whether nothing is known about the outlet, so it takes any component that may be placed.</param>
/// <param name="Max">The most it holds.</param>
public record DesignOutletRule(string Name, IReadOnlyList<string> Components, IReadOnlyList<string> Categories, bool Open, int? Max = null);
