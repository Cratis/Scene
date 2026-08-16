// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// A named target: a platform, a default size class, an ordered list of component packages, and the
/// application shell and visual theme it selects. Declaration order in <see cref="Packages"/> is override
/// priority - a later package shadows an earlier one when both resolve the same bare component name.
/// <c>core</c> is always the final fallback, so a minimum vocabulary resolves regardless of which packages
/// a profile lists.
/// </summary>
/// <param name="Name">The profile's name.</param>
/// <param name="TargetPlatform">The platform this profile targets (e.g. <c>web</c>, <c>ios</c>, <c>android</c>, <c>desktop</c>).</param>
/// <param name="Packages">The component packages this profile draws from, in override-priority order.</param>
/// <param name="DefaultSizeClass">The size class assumed when the renderer cannot otherwise determine one.</param>
/// <param name="Layout">
/// The name of the <see cref="Layouts.Layout"/> this profile renders inside - the application's base
/// navigational shell, normally provided by a <see cref="Packages.PackageKind.Blueprint"/> in
/// <paramref name="Packages"/>. <see langword="null"/> when the profile does not select one.
/// </param>
/// <param name="Theme">
/// The name of the <see cref="Theme"/> this profile applies, or <see langword="null"/> when it selects
/// none. A theme is only meaningful relative to a set of packages, which is why it is chosen here rather
/// than by a screen.
/// </param>
/// <remarks>
/// A profile is where the choices that make a description concrete are made: which component vocabulary,
/// which shell, which theme. Deliberately none of them are stated by a <see cref="Screens.Screen"/> - that
/// is what keeps a screen portable across targets, and what lets one application ship a different shell to
/// the web than to a phone.
/// </remarks>
public record UiProfile(
    string Name,
    string TargetPlatform,
    IReadOnlyList<string> Packages,
    SizeClass? DefaultSizeClass = null,
    string? Layout = null,
    string? Theme = null);
