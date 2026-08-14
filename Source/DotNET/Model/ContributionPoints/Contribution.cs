// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;

namespace Cratis.Scene.Model.ContributionPoints;

/// <summary>
/// One piece of content contributed to a <see cref="ContributionPoint"/>. Resolution to a specific
/// contribution point (nearest enclosing, or an explicit <c>... in &lt;ContributionPoint&gt;</c> override)
/// happens before this model is built — this record already carries the resolved target.
/// </summary>
/// <param name="ContributionPointName">The resolved name of the contribution point this targets.</param>
/// <param name="Content">The contributed content.</param>
/// <param name="Order">Where this contribution sorts relative to others at the same contribution point.</param>
public record Contribution(string ContributionPointName, Element Content, int? Order = null);
