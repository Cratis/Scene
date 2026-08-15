// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// Arranges a slot's content by reflowing it with the neutral <c>flow</c> primitives (<see cref="FlowRow"/>,
/// <see cref="FlowColumn"/>, <see cref="FlowGrid"/>, <see cref="FlowLeaf"/>), recomputed against the
/// current size class rather than fixed per breakpoint. Deliberately not CSS-flavored — a renderer maps these
/// primitives to whatever native layout mechanism it has (flexbox/grid in <c>Scene.React</c>, something else
/// in a future native renderer).
/// </summary>
/// <param name="Root">The root of the flow tree.</param>
/// <param name="Overrides">
/// Replacements for <paramref name="Root"/> targeting specific width/height size classes - the most
/// specific match wins (both dimensions targeted beats one), and the last declared wins among equally
/// specific matches. <see langword="null"/> or empty when the tree never varies by size class.
/// </param>
public record FlowArrangement(FlowNode Root, IReadOnlyList<FlowOverride>? Overrides = null) : Arrangement;
