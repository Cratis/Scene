// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// A named target: a platform, a default size class, an ordered list of component packages, and the
/// application shell and visual theme it selects. Declaration order in <see cref="Packages"/> is override
/// priority - a later package shadows an earlier one when both resolve the same bare component name.
/// <c language="csharp">core</c> is always the final fallback, so a minimum vocabulary resolves regardless of which packages
/// a profile lists.
/// </summary>
/// <param name="Name">The profile's name.</param>
/// <param name="TargetPlatform">The platform this profile targets (e.g. <c language="csharp">web</c>, <c language="csharp">ios</c>, <c language="csharp">android</c>, <c language="csharp">desktop</c>).</param>
/// <param name="Packages">The component packages this profile draws from, in override-priority order.</param>
/// <param name="DefaultSizeClass">The size class assumed when the renderer cannot otherwise determine one.</param>
/// <param name="Layout">
/// The name of the <see cref="Layouts.Layout"/> this profile renders inside - the application's base
/// navigational shell, normally provided by a <see cref="Packages.PackageKind.Blueprint"/> in
/// <paramref name="Packages"/>. <see langword="null"/> when the profile does not select one. Legacy: still readable, superseded by
/// <paramref name="Root"/>.
/// </param>
/// <param name="Theme">
/// The name of the <see cref="Theme"/> this profile applies, or <see langword="null"/> when it selects
/// none. A theme is only meaningful relative to a set of packages, which is why it is chosen here rather
/// than by a screen.
/// </param>
/// <param name="SampleData">
/// Which sample data the application previews with at design and preview time: the active pack, chosen once here for the whole
/// application (own or from a blueprint), plus the rare shape-to-read-model mappings and per-read-model pack bindings. Never
/// stated by a screen, slice or component, and never part of a production build. <see langword="null"/> selects the blueprint's
/// default pack, then generated data.
/// </param>
/// <param name="Root">
/// The application's root template (its shell): a <see cref="RootTemplate.Template"/> reference - own or blueprint, with a version pin -
/// and the shell's own options. Supersedes <paramref name="Layout"/>; <see langword="null"/> falls back to <paramref name="Layout"/>
/// and then to the blueprint's default shell.
/// </param>
/// <param name="Appearance">The colour scheme, accent colour, corner style and font the application presents, or <see langword="null"/> for the theme's defaults.</param>
/// <param name="Defaults">Application-wide authoring defaults such as the template new screens start from, or <see langword="null"/> for none.</param>
/// <param name="Identity">The application's name and logo, set once and drawn by every blueprint, or <see langword="null"/> for the host's application name and initials taken from it.</param>
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
    TargetSizeClass? DefaultSizeClass = null,
    string? Layout = null,
    string? Theme = null,
    SampleData.SampleDataSelection? SampleData = null,
    RootTemplate? Root = null,
    ProfileAppearance? Appearance = null,
    ProfileDefaults? Defaults = null,
    ProfileIdentity? Identity = null);
