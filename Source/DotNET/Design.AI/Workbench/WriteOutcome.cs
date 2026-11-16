// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// What came of a write: the diagnostics are what the model repairs from.
/// </summary>
/// <param name="Applied">Whether the write came out clean and was kept.</param>
/// <param name="Summary">What happened, in a sentence.</param>
/// <param name="Diagnostics">What the compiler and the catalogue checks reported.</param>
/// <param name="Touched">The screens, or screen templates, the write changed.</param>
/// <param name="Outcomes">What happened to each operation, when the write was operations.</param>
internal sealed record WriteOutcome(
    bool Applied,
    string Summary,
    IReadOnlyList<DesignDiagnostic> Diagnostics,
    IReadOnlyList<string> Touched,
    IReadOnlyList<DesignOutcome>? Outcomes = null);
