// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// One problem found while resolving the effective shell or checking the profile around it.
/// </summary>
/// <param name="Code">The engine-owned code.</param>
/// <param name="Message">The human message. It carries real names (templates, screens, outlets, packages), never ids.</param>
/// <param name="Subject">The thing the problem is about (a template, screen, theme or package name), when there is one.</param>
public record ShellDiagnostic(ShellDiagnosticCode Code, string Message, string? Subject = null);
