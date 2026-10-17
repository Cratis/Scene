// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

using Cratis.Scene.Engine.Shell;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One reason the profile cannot be applied, with what the user needs to fix it.
/// </summary>
/// <param name="Code">What is wrong.</param>
/// <param name="Subject">The package, layout, template or slot that is the problem.</param>
/// <param name="Message">A sentence with the real names, ready to show. Never an id or a placeholder.</param>
/// <param name="ShellCode">For <see cref="ProfileBlockerCode.ShellUnusable"/>: the shell's own code.</param>
/// <param name="Severity">How seriously the problem stops the profile.</param>
/// <param name="Section">The section of the designer the problem belongs to.</param>
/// <param name="Fix">The one-click fix, when there is one.</param>
[method: JsonConstructor]
public record ProfileBlocker(
    ProfileBlockerCode Code,
    string Subject,
    string Message,
    ShellDiagnosticCode? ShellCode = null,
    ProblemSeverity Severity = ProblemSeverity.Blocker,
    ProfileSection Section = ProfileSection.Packages,
    ProfileFix? Fix = null)
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ProfileBlocker"/> record with the members it had before the severity, section and fix.
    /// Kept so a package compiled against an earlier version still finds the constructor it was built with.
    /// </summary>
    /// <param name="code">What is wrong.</param>
    /// <param name="subject">The thing that is the problem.</param>
    /// <param name="message">A sentence with the real names.</param>
    /// <param name="shellCode">For a shell that cannot be used: the shell's own code.</param>
    public ProfileBlocker(ProfileBlockerCode code, string subject, string message, ShellDiagnosticCode? shellCode)
        : this(code, subject, message, shellCode, ProblemSeverity.Blocker, ProfileSection.Packages, null)
    {
    }
}
