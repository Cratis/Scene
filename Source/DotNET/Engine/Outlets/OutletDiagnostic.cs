// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// One problem with the outlets of a chain of levels.
/// </summary>
/// <param name="Code">The engine-owned code.</param>
/// <param name="Severity">How serious it is.</param>
/// <param name="Outlet">The name of the outlet.</param>
/// <param name="Message">The human message; it carries real names.</param>
/// <param name="Owner">The name of the level the problem is written at; <see langword="null"/> when no level is to blame.</param>
/// <param name="Item">The id of the item concerned, when one is.</param>
public record OutletDiagnostic(OutletDiagnosticCode Code, OutletDiagnosticSeverity Severity, string Outlet, string Message, string? Owner = null, string? Item = null);
