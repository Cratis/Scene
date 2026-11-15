// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// One finding from inspecting, editing, validating or resolving. Plain data, so a host can show it, persist it or ship it to another process.
/// </summary>
/// <param name="Code">The reason, which a host switches on.</param>
/// <param name="Severity">How serious the finding is.</param>
/// <param name="Message">What happened, for a person.</param>
/// <param name="NodeId">The node the finding is about, when there is one.</param>
/// <param name="Instance">The instance the finding is about.</param>
/// <param name="Component">The id of the component the finding is about.</param>
/// <param name="Path">The property path the finding is about.</param>
/// <param name="ItemId">The collection item the finding is about.</param>
public record SceneDiagnostic(
    DiagnosticCode Code,
    DiagnosticSeverity Severity,
    string Message,
    string? NodeId = null,
    string? Instance = null,
    string? Component = null,
    string? Path = null,
    string? ItemId = null);
