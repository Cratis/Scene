// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// A UI profile as it was kept before the root template: the profile itself - which may carry the legacy
/// <see cref="UiProfile.Layout"/> name - and the settings the Studio workspace kept next to it as separate fields.
/// Everything but <paramref name="Profile"/> is optional; an absent or blank value means "not set".
/// </summary>
/// <param name="Profile">The profile as read; its <see cref="UiProfile.Layout"/> is the legacy shell name.</param>
/// <param name="Shell">The blueprint package the Studio workspace named as the application's shell (its legacy <c language="csharp">Shell</c>).</param>
/// <param name="Layout">The layout name the Studio workspace kept; takes precedence over <see cref="UiProfile.Layout"/> when both are set.</param>
/// <param name="NavigationMode">The navigation mode (menu mode) of the shell, such as <c language="csharp">Sidebar</c>. It becomes the root template's <c language="csharp">navigationMode</c> option.</param>
/// <param name="ColorScheme"><c language="csharp">Light</c>, <c language="csharp">Dark</c> or <c language="csharp">System</c>, in any case. It becomes the profile's appearance.</param>
/// <param name="Accent">The accent colour. It becomes the profile's appearance.</param>
/// <param name="DefaultScreenTemplate">The name of the screen template new screens start from. It becomes <see cref="ProfileDefaults.NewScreenTemplate"/>.</param>
public record LegacyProfile(
    UiProfile Profile,
    string? Shell = null,
    string? Layout = null,
    string? NavigationMode = null,
    string? ColorScheme = null,
    string? Accent = null,
    string? DefaultScreenTemplate = null);
