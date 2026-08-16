// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// Queries over a set of <see cref="ScenePackage"/>s - what a package picker asks to build the choices it
/// offers. Kept beside <see cref="PackageDependencyResolver"/> rather than inside it: the resolver answers
/// "given this selection, what does it need", these answer "what can be selected in the first place".
/// </summary>
public static class PackageCatalog
{
    /// <summary>
    /// The packages of a given kind.
    /// </summary>
    /// <param name="catalog">The packages to filter.</param>
    /// <param name="kind">The <see cref="PackageKind"/> to keep.</param>
    /// <returns>Every package of <paramref name="kind"/>, in catalog order.</returns>
    public static IReadOnlyList<ScenePackage> OfKind(IReadOnlyList<ScenePackage> catalog, PackageKind kind) =>
        [.. catalog.Where(package => package.Kind == kind)];

    /// <summary>
    /// The component libraries a profile can be founded on - the ones that do not themselves layer on
    /// another component library.
    /// </summary>
    /// <param name="catalog">The packages to search.</param>
    /// <returns>Every base <see cref="PackageKind.ComponentLibrary"/>, in catalog order.</returns>
    /// <remarks>
    /// "Base" is not a declared property; it falls out of the dependency graph. PrimeReact depends on a
    /// styling package but on no other component library, so it is a base. <c>@cratis/components</c>
    /// depends on PrimeReact, so it is not - it is something you add on top of a base you already picked.
    /// Deriving it this way means a third party shipping their own library gets classified correctly
    /// without having to declare anything extra.
    /// </remarks>
    public static IReadOnlyList<ScenePackage> BaseComponentLibraries(IReadOnlyList<ScenePackage> catalog)
    {
        var libraries = catalog.Where(package => package.Kind == PackageKind.ComponentLibrary).ToList();
        var names = new HashSet<string>(libraries.Select(package => package.Name), StringComparer.Ordinal);
        return [.. libraries.Where(package => !package.Dependencies.Any(dependency => names.Contains(dependency.Name)))];
    }

    /// <summary>
    /// The packages that can be added to a selection without pulling anything else in - every dependency
    /// they declare is already selected.
    /// </summary>
    /// <param name="catalog">The packages to search.</param>
    /// <param name="selected">The package names already chosen.</param>
    /// <returns>Every not-yet-selected package whose dependencies the selection already satisfies, in catalog order.</returns>
    /// <remarks>
    /// This is the "what else works with what I have picked" list: choose PrimeReact and Tailwind, and
    /// <c>@cratis/components</c> becomes available because both of its dependencies are now met. It is
    /// deliberately stricter than <see cref="PackageDependencyResolver"/>, which will happily add the
    /// missing dependencies for you - a picker wants to show what fits, not what would drag more in.
    /// </remarks>
    public static IReadOnlyList<ScenePackage> AvailableFor(IReadOnlyList<ScenePackage> catalog, IReadOnlyList<string> selected)
    {
        var chosen = new HashSet<string>(selected, StringComparer.Ordinal);
        return
        [
            .. catalog.Where(package =>
                !chosen.Contains(package.Name) &&
                package.Dependencies.All(dependency => chosen.Contains(dependency.Name)))
        ];
    }

    /// <summary>
    /// Every component name the selected packages declare between them, without duplicates.
    /// </summary>
    /// <param name="catalog">The packages to draw from.</param>
    /// <param name="selected">The package names in scope.</param>
    /// <returns>The component names, sorted, so a component picker has a stable list to show.</returns>
    public static IReadOnlyList<string> ComponentsFor(IReadOnlyList<ScenePackage> catalog, IReadOnlyList<string> selected)
    {
        var chosen = new HashSet<string>(selected, StringComparer.Ordinal);
        return
        [
            .. catalog
                .Where(package => chosen.Contains(package.Name))
                .SelectMany(package => package.Components)
                .Distinct(StringComparer.Ordinal)
                .Order(StringComparer.Ordinal)
        ];
    }

    /// <summary>
    /// Builds the component-name catalog <see cref="Profiles.PackageResolver.Resolve"/> resolves against.
    /// </summary>
    /// <param name="catalog">The packages to draw from.</param>
    /// <returns>Each package's declared component names, keyed by package name.</returns>
    public static IReadOnlyDictionary<string, IReadOnlyList<string>> ToComponentCatalog(IReadOnlyList<ScenePackage> catalog)
    {
        var components = new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal);
        foreach (var package in catalog)
        {
            components[package.Name] = package.Components;
        }

        return components;
    }
}
