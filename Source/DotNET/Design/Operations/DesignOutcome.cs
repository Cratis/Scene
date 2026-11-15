// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What happened to one operation: applied, or refused with the reason and alternatives; either way with its diagnostics.
/// </summary>
/// <param name="Operation">The operation.</param>
/// <param name="Applied">Whether it was applied.</param>
/// <param name="Diagnostics">Its diagnostics.</param>
/// <param name="SceneEdits">The Scene edits it lowered to and the engine applied.</param>
/// <param name="Summary">What it did, in words.</param>
/// <param name="Code">Why it was refused.</param>
/// <param name="Reason">Why it was refused, in words.</param>
/// <param name="Alternatives">The nearest operations that would be accepted.</param>
/// <param name="Focus">What it drew attention to.</param>
/// <param name="Controls">The tweak controls it offers.</param>
/// <param name="Variations">The layouts it offers.</param>
/// <param name="Proposals">Changes it proposes to the design system.</param>
public record DesignOutcome(
    DesignOperation Operation,
    bool Applied,
    IReadOnlyList<DesignDiagnostic> Diagnostics,
    IReadOnlyList<ScopedSceneEdit> SceneEdits,
    string? Summary = null,
    string? Code = null,
    string? Reason = null,
    IReadOnlyList<DesignAlternative>? Alternatives = null,
    DesignFocus? Focus = null,
    IReadOnlyList<TweakControl>? Controls = null,
    IReadOnlyList<VariationCandidate>? Variations = null,
    IReadOnlyList<DesignSystemProposal>? Proposals = null);
