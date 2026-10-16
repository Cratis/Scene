// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What switching the application's shell does. Pure data: the host applies it as one undoable edit.
/// </summary>
/// <param name="From">The name of the current shell.</param>
/// <param name="To">The name of the shell being switched to.</param>
/// <param name="FromPrimary">The current shell's primary outlet.</param>
/// <param name="ToPrimary">The new shell's primary outlet.</param>
/// <param name="IsNoOp">Whether nothing changes: the same shell, so every outlet stays.</param>
/// <param name="Moves">Every outlet of the current shell (and any outlet screens use that it lacks), in declared order.</param>
/// <param name="AddPackages">Packages the switch adds to the profile: the new shell's blueprint when it is not yet among the profile's packages.</param>
/// <param name="Blockers">What stops the switch, with the engine code and a message with real names. Empty when the switch can be made.</param>
/// <param name="Warnings">Problems the switch does not cause or cannot fix but the user should see (an incompatible theme, a missing package).</param>
public record ShellSwitchPlan(
    string From,
    string To,
    string FromPrimary,
    string ToPrimary,
    bool IsNoOp,
    IReadOnlyList<ShellOutletMove> Moves,
    IReadOnlyList<string> AddPackages,
    IReadOnlyList<ShellDiagnostic> Blockers,
    IReadOnlyList<ShellDiagnostic> Warnings)
{
    /// <summary>
    /// Gets a value indicating whether there are no blockers.
    /// </summary>
    public bool CanSwitch => Blockers.Count == 0;
}
