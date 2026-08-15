// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Resolves a bare or package-qualified component name against a <see cref="UiProfile"/>'s package list -
/// the design-time half of Cratis/Scene#3, run by Studio's tooling. Stage's build-time resolution and
/// Scene.React's runtime resolution use the TypeScript twin of this algorithm in <c>@cratis/scene.engine</c>;
/// both sides are asserted against the same shared fixture corpus so they cannot drift apart.
/// </summary>
public static class PackageResolver
{
    /// <summary>
    /// The name of the package that is always present as the final fallback, regardless of what a
    /// <see cref="UiProfile"/> lists in its own <see cref="UiProfile.Packages"/>.
    /// </summary>
    public const string Core = "core";

    /// <summary>
    /// Computes a <see cref="UiProfile"/>'s effective package priority order - its own declared packages,
    /// with <see cref="Core"/> prepended as the final fallback when not already present.
    /// </summary>
    /// <param name="profile">The <see cref="UiProfile"/> to compute the order for.</param>
    /// <returns>The packages in ascending priority order - the last entry wins when more than one declares the same name.</returns>
    /// <remarks>
    /// <see cref="Core"/> is the lowest-priority fallback, so it belongs at the FRONT of the ascending-priority
    /// order, not the back - prepending it (rather than appending) is what makes every explicitly listed
    /// package outrank it.
    /// </remarks>
    public static IReadOnlyList<string> EffectivePackages(UiProfile profile) =>
        profile.Packages.Contains(Core) ? profile.Packages : [Core, .. profile.Packages];

    /// <summary>
    /// Resolves a component name against a <see cref="UiProfile"/>.
    /// </summary>
    /// <param name="requestedName">The name as written on a screen - bare (<c>button</c>) or package-qualified (<c>Internal.Widgets.TrendChart</c>).</param>
    /// <param name="profile">The <see cref="UiProfile"/> whose package list to resolve against.</param>
    /// <param name="catalog">Every active package's declared component names, keyed by package name.</param>
    /// <returns>The <see cref="ComponentResolution"/>, or <see langword="null"/> when nothing in scope declares the name.</returns>
    /// <remarks>
    /// A name containing a <c>.</c> is package-qualified - everything before the last <c>.</c> is the package,
    /// everything after is the bare name - and resolves directly against that one package, bypassing shadow
    /// tracking and the profile's priority order entirely (an author naming the package explicitly has
    /// already disambiguated). A name with no <c>.</c> is bare and resolves by walking
    /// <see cref="EffectivePackages"/> from highest to lowest priority; every other active package that also
    /// declares the name is recorded in <see cref="ComponentResolution.Shadows"/>, not discarded, so a caller
    /// can explain the pick rather than only report it.
    /// </remarks>
    public static ComponentResolution? Resolve(string requestedName, UiProfile profile, IReadOnlyDictionary<string, IReadOnlyList<string>> catalog)
    {
        var lastDot = requestedName.LastIndexOf('.');
        if (lastDot >= 0)
        {
            var qualifiedPackage = requestedName[..lastDot];
            var qualifiedName = requestedName[(lastDot + 1)..];
            return Declares(catalog, qualifiedPackage, qualifiedName)
                ? new ComponentResolution(qualifiedName, qualifiedPackage, [])
                : null;
        }

        var priority = EffectivePackages(profile);
        var matches = new List<string>();
        for (var index = priority.Count - 1; index >= 0; index--)
        {
            if (Declares(catalog, priority[index], requestedName))
            {
                matches.Add(priority[index]);
            }
        }

        return matches.Count == 0 ? null : new ComponentResolution(requestedName, matches[0], matches.Skip(1).ToList());
    }

    static bool Declares(IReadOnlyDictionary<string, IReadOnlyList<string>> catalog, string package, string name) =>
        catalog.TryGetValue(package, out var components) && components.Contains(name);
}
