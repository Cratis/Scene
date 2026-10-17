// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// One edit <see cref="ShellSwitchApplier.Apply"/> made, for the review list.
/// </summary>
/// <param name="Kind">Whether it moved content or a template's placement.</param>
/// <param name="Outlet">The outlet of the current shell.</param>
/// <param name="Action">What the plan does with that outlet.</param>
/// <param name="Count">How many elements moved or were dropped; 1 for a placement.</param>
/// <param name="Description">A sentence with the real names of the screen or template and the outlets, ready to show.</param>
/// <param name="Screen">The screen whose content moved. <see langword="null"/> for a placement.</param>
/// <param name="Template">The template whose placement moved. <see langword="null"/> for content.</param>
/// <param name="Target">The outlet of the new shell. <see langword="null"/> when the content or the placement is dropped.</param>
public record ShellSwitchChange(
    ShellSwitchChangeKind Kind,
    string Outlet,
    ShellOutletAction Action,
    int Count,
    string Description,
    string? Screen = null,
    string? Template = null,
    string? Target = null);
