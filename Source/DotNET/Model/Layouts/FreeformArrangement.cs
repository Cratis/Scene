// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// Arranges a slot's content with one placement variant per size class — the Xcode-storyboard model.
/// The same data/action/form contract is shared across every variant; only placement differs.
/// </summary>
/// <param name="Variants">The placement variants, one per targeted size class.</param>
public record FreeformArrangement(IReadOnlyList<FreeformVariant> Variants) : Arrangement;
