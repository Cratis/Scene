// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The result of applying lowered steps.
/// </summary>
/// <param name="Workspace">The workspace after; the one the steps started from when the engine refused one of them.</param>
/// <param name="Diagnostics">The engine's findings.</param>
/// <param name="SceneEdits">The Scene edits applied.</param>
/// <param name="Refusal">What the engine said when it refused a step.</param>
internal sealed record LoweringResult(DesignWorkspace Workspace, IReadOnlyList<DesignDiagnostic> Diagnostics, IReadOnlyList<ScopedSceneEdit> SceneEdits, string? Refusal = null);
