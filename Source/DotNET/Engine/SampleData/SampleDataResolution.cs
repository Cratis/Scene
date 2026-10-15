// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// The outcome of <see cref="SampleDataResolver.Resolve"/>.
/// </summary>
/// <param name="Source">Which rung supplied the rows.</param>
/// <param name="Locale">The locale of the data: the pack's, or the one generated data followed.</param>
/// <param name="Rows">The rows.</param>
/// <param name="Diagnostics">Problems found on the way.</param>
/// <param name="Pack">The identity of the pack that supplied the rows; null for generated, disabled and none.</param>
/// <param name="Shape">The shape name the rows belong to.</param>
public record SampleDataResolution(
    SampleDataResolutionSource Source,
    string Locale,
    IReadOnlyList<JsonObject> Rows,
    IReadOnlyList<SampleDataDiagnostic> Diagnostics,
    string? Pack = null,
    string? Shape = null);
