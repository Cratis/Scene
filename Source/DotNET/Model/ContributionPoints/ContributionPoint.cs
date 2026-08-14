// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.ContributionPoints;

/// <summary>
/// A named point in the element tree that a widget declares (<c>contributes &lt;Name&gt;</c>) and that other
/// templates contribute content to (<c>contribute to &lt;Name&gt;</c>). Aggregation is a computed view over
/// whatever is currently contributed from the tree beneath it — a widget bound to a contribution point is
/// never wired to a fixed source.
/// </summary>
/// <param name="Name">The contribution point's name.</param>
public record ContributionPoint(string Name);
