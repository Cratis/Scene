// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// The effective configuration of every component in an editing scope's chain.
/// </summary>
/// <param name="Components">The components.</param>
/// <param name="Diagnostics">What was found while resolving.</param>
public record EffectiveConfiguration(
    IReadOnlyList<EffectiveComponentConfiguration> Components,
    IReadOnlyList<SceneDiagnostic> Diagnostics);
