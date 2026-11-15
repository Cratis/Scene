// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// One component of the design system.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Parts">The parts it declares.</param>
/// <param name="Variants">Its variants.</param>
/// <param name="MapsTo">The Scene component it states it maps to.</param>
/// <param name="BoundTo">The Scene component it is bound to, when one is.</param>
public record DesignSystemComponentEntry(string Name, IReadOnlyList<string> Parts, IReadOnlyList<DesignVariantEntry> Variants, string? MapsTo = null, string? BoundTo = null);
