// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// One outlet of the current shell and where its content goes.
/// </summary>
/// <param name="Outlet">The outlet of the current shell.</param>
/// <param name="Action">What happens to its content.</param>
/// <param name="Screens">The screens that place content in the outlet, in document order.</param>
/// <param name="Description">A sentence with the real names of the screens, outlets and shells, ready to show.</param>
/// <param name="Target">The outlet of the new shell the content lands in. <see langword="null"/> when it is dropped or not decided.</param>
/// <param name="Choices">For an <see cref="ShellOutletAction.Unresolved"/> outlet: the choices on offer, move into the primary outlet first, then each other outlet, then drop.</param>
public record ShellOutletMove(
    string Outlet,
    ShellOutletAction Action,
    IReadOnlyList<string> Screens,
    string Description,
    string? Target = null,
    IReadOnlyList<OutletRemap>? Choices = null);
