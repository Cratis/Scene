// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Shell;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One reason the profile cannot be applied, with what the user needs to fix it.
/// </summary>
/// <param name="Code">What is wrong.</param>
/// <param name="Subject">The package, layout, template or slot that is the problem.</param>
/// <param name="Message">A sentence with the real names, ready to show. Never an id or a placeholder.</param>
/// <param name="ShellCode">For <see cref="ProfileBlockerCode.ShellUnusable"/>: the shell's own code.</param>
public record ProfileBlocker(ProfileBlockerCode Code, string Subject, string Message, ShellDiagnosticCode? ShellCode = null);
