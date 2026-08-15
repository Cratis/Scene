// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.ContributionPoints;

/// <summary>
/// A contribution to the built-in <c>Navigation</c> contribution point. How <c>navigate to &lt;Screen&gt;</c>
/// becomes a concrete route (URL path, query string, or native deep link) is owned by the renderer's NavBar
/// widget, not this record — this only carries the declared shape.
/// </summary>
/// <param name="Label">The item's label — plain text, or the literal <c>$strings.&lt;key&gt;</c> reference.</param>
/// <param name="TargetScreen">The resolved name of the screen this navigates to.</param>
/// <param name="RouteParameterBindings">Route parameter values, keyed by parameter name.</param>
/// <param name="Order">Where this item sorts relative to its siblings.</param>
/// <param name="Group">The group this item belongs to, if the NavBar widget organizes items into groups.</param>
public record NavigationItem(
    string Label,
    string TargetScreen,
    IReadOnlyDictionary<string, BindingExpression> RouteParameterBindings,
    int? Order = null,
    string? Group = null);
