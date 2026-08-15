// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Checks a <see cref="Theme"/>'s <see cref="Theme.CompatibleWith"/> declaration against a
/// <see cref="UiProfile"/>'s package list - part of Cratis/Scene#5. The same rule Screenplay's compiler
/// already applies to warn on an incompatible <c>ui profile</c>/<c>theme</c> pairing, reused here so
/// Stage (build time) and Studio (design time) don't each reimplement it - and so <c>Scene.React</c> knows
/// which packages to actually apply a theme's tokens to. There is deliberately no implicit exemption for
/// <c>core</c>: a theme wanting broad applicability declares <c>compatible with core</c> itself, exactly
/// like the profile/package resolver has no implicit special case for it either.
/// </summary>
public static class ThemeCompatibility
{
    /// <summary>
    /// Finds the packages a <see cref="UiProfile"/> declares that a <see cref="Theme"/> is not declared
    /// compatible with - the same set Screenplay's compiler warns on for an incompatible pairing.
    /// </summary>
    /// <param name="theme">The <see cref="Theme"/> to check.</param>
    /// <param name="profile">The <see cref="UiProfile"/> whose packages to check against.</param>
    /// <returns>The packages in <see cref="UiProfile.Packages"/> that <paramref name="theme"/> does not declare compatibility with.</returns>
    public static IReadOnlyList<string> IncompatiblePackages(Theme theme, UiProfile profile) =>
        profile.Packages.Where(package => !theme.CompatibleWith.Contains(package)).ToList();

    /// <summary>
    /// Whether a <see cref="Theme"/> is compatible with every package a <see cref="UiProfile"/> declares.
    /// </summary>
    /// <param name="theme">The <see cref="Theme"/> to check.</param>
    /// <param name="profile">The <see cref="UiProfile"/> whose packages to check against.</param>
    /// <returns><see langword="true"/> when <paramref name="theme"/> declares compatibility with every package <paramref name="profile"/> lists.</returns>
    public static bool IsCompatible(Theme theme, UiProfile profile) => IncompatiblePackages(theme, profile).Count == 0;

    /// <summary>
    /// Finds the packages a <see cref="Theme"/>'s tokens actually apply to for a given
    /// <see cref="UiProfile"/> - the packages the profile activates that the theme also declares
    /// compatibility with. This is what a renderer scopes token application to, rather than applying a
    /// theme's tokens globally.
    /// </summary>
    /// <param name="theme">The <see cref="Theme"/> to apply.</param>
    /// <param name="profile">The active <see cref="UiProfile"/>.</param>
    /// <returns>The packages both active in <paramref name="profile"/> and declared compatible by <paramref name="theme"/>.</returns>
    public static IReadOnlyList<string> ApplicablePackages(Theme theme, UiProfile profile) =>
        profile.Packages.Where(theme.CompatibleWith.Contains).ToList();
}
