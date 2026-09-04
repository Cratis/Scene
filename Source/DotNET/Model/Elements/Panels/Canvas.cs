// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// Places its children at absolute coordinates within a coordinate space of its own. A child states where
/// it sits through the <c>Canvas.Left</c>, <c>Canvas.Top</c>, <c>Canvas.Right</c> and <c>Canvas.Bottom</c>
/// keys of its <see cref="SceneElement.Properties"/>, which is how an attached property is carried in a
/// model that has no attached properties of its own.
/// </summary>
/// <remarks>
/// <para>
/// Named for <c>@cratis/components</c>' <c>Canvas</c>, which is the surface a Cratis application actually
/// draws one on. The vocabulary is shared deliberately: a designer placing components on a canvas and the
/// model recording where they landed should not need two words for the same thing.
/// </para>
/// <para>
/// This is a panel in the element tree, and is not the same concept as a
/// <see cref="Layouts.FreeformArrangement"/> - that arranges a <em>layout slot's</em> content, with one
/// placement variant per size class. A canvas places elements inside a single coordinate space, and is
/// what a free-placement design surface serializes to.
/// </para>
/// </remarks>
public record Canvas : Panel
{
    /// <summary>
    /// Gets the size of the coordinate space children are placed in - the design surface a
    /// <c>Canvas.Left</c>/<c>Canvas.Top</c> pair is measured against.
    /// </summary>
    /// <remarks>
    /// Either dimension left unspecified means the renderer decides, exactly as elsewhere. This is also
    /// what tells a canvas apart from a plain <see cref="Panel"/>: the model carries no discriminator,
    /// so a panel is recognized by the property it alone declares.
    /// </remarks>
    public Size Extent { get; init; } = new();
}
