// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The result of switching the colour scheme.
/// </summary>
/// <param name="Profile">The profile after the switch.</param>
/// <param name="ThemeChanged">Whether the theme moved to the matching one.</param>
/// <param name="Message">The line for the status bar; empty when nothing moved.</param>
public record ColorSchemeEdit(UiProfile Profile, bool ThemeChanged, string Message);
