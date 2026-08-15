// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.SizeClasses;
using Cratis.Scene.Model.Starters;

namespace Cratis.Scene.Engine.Starters;

/// <summary>
/// Builds the sandboxed <see cref="UiProfile"/> a <see cref="UiStarter"/>'s gallery boots through - part of
/// Cratis/Scene#6. Studio runs a starter's gallery screens as a working mini-app rather than a simulated
/// preview, so the gallery needs a real profile scoped to exactly the starter's own package list, not the
/// consuming project's eventual profile.
/// </summary>
public static class StarterProfileBuilder
{
    /// <summary>
    /// Builds the sandboxed <see cref="UiProfile"/> for a <see cref="UiStarter"/>'s gallery.
    /// </summary>
    /// <param name="starter">The <see cref="UiStarter"/> to build the profile for.</param>
    /// <param name="targetPlatform">The platform the gallery runs on (e.g. <c>web</c>).</param>
    /// <param name="defaultSizeClass">The size class assumed when the renderer cannot otherwise determine one.</param>
    /// <returns>A <see cref="UiProfile"/> named after the starter, scoped to exactly its own <see cref="UiStarter.Packages"/>.</returns>
    public static UiProfile BuildProfile(UiStarter starter, string targetPlatform, SizeClass? defaultSizeClass = null) =>
        new(starter.Name, targetPlatform, starter.Packages, defaultSizeClass);
}
