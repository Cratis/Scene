// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What the user chose to do with the content of an outlet the new shell does not have.
/// </summary>
/// <param name="Action"><see cref="ShellOutletAction.MoveToPrimary"/>, <see cref="ShellOutletAction.MapTo"/> or <see cref="ShellOutletAction.Drop"/>.</param>
/// <param name="Target">For <see cref="ShellOutletAction.MapTo"/>: the outlet of the new shell to move the content into.</param>
public record OutletRemap(ShellOutletAction Action, string? Target = null);
