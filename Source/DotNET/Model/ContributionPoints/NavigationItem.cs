// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.ContributionPoints;

/// <summary>
/// A contribution to the built-in <c language="csharp">Navigation</c> contribution point. How <c language="csharp">navigate to &lt;Screen&gt;</c>
/// becomes a concrete route (URL path, query string, or native deep link) is owned by the renderer's NavBar
/// widget, not this record — this only carries the declared shape.
/// </summary>
/// <param name="Label">The item's label — plain text, or the literal <c language="csharp">$strings.&lt;key&gt;</c> reference.</param>
/// <param name="TargetScreen">Legacy resolved name of the screen this navigates to.</param>
/// <param name="RouteParameterBindings">Legacy route parameter values, keyed by parameter name.</param>
/// <param name="Id">Stable contribution identity, independent of the label.</param>
/// <param name="Icon">Qualified icon reference for toolbar/navigation chrome.</param>
/// <param name="Presentation">Whether chrome shows icon, text, or both.</param>
/// <param name="Destination">The typed destination this item activates.</param>
/// <param name="Order">Where this item sorts relative to its siblings.</param>
/// <param name="Group">The group this item belongs to, if the NavBar widget organizes items into groups.</param>
public record NavigationItem(
    string Label,
    string TargetScreen,
    IReadOnlyDictionary<string, BindingExpression> RouteParameterBindings,
    string? Id = null,
    string? Icon = null,
    string? Presentation = null,
    DestinationReference? Destination = null,
    int? Order = null,
    string? Group = null);
