// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The navigation mode after a shell switch.
/// </summary>
/// <param name="Mode">The mode after the switch.</param>
/// <param name="Changed">Whether the switch changed the mode.</param>
/// <param name="Message">The line a designer puts in its status bar; <see langword="null"/> when nothing changed.</param>
public record MenuModeChange(NavigationMode Mode, bool Changed, string? Message);
