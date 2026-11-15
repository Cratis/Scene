// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// Links every component of a design system to the Scene component that renders it, and checks that the component supports what the design system declares.
/// The TypeScript twin is <c language="csharp">linkDesignSystem</c>.
/// </summary>
/// <remarks>
/// A design-system component finds its Scene component by name through the profile's packages, or by the <c language="csharp">maps to</c> it states; its variant reaches the
/// component through the well-known property (<c language="csharp">variant</c>, else <c language="csharp">emphasis</c>), or the property and per-variant values the design system states.
/// Every part, variant or state the component does not support, every component nobody renders and every component that declares no anatomy is a diagnostic; nothing is dropped
/// silently, so what a package cannot render is always reported.
/// </remarks>
public static class DesignLinker
{
    /// <summary>
    /// The well-known properties a variant is passed in, in the order they are tried.
    /// </summary>
    public static readonly IReadOnlyList<string> WellKnownVariantProperties = ["variant", "emphasis"];

    /// <summary>
    /// Links the design system.
    /// </summary>
    /// <param name="designSystem">The design system.</param>
    /// <param name="profile">The profile whose packages the components are looked up in.</param>
    /// <param name="catalog">Every active package's declared component names, keyed by package name.</param>
    /// <param name="components">The active packages' components.</param>
    /// <returns>The links and the diagnostics.</returns>
    public static DesignLinking Link(
        DesignSystem designSystem,
        UiProfile profile,
        IReadOnlyDictionary<string, IReadOnlyList<string>> catalog,
        IReadOnlyList<LinkableComponent> components)
    {
        var links = new List<DesignLink>();
        var diagnostics = new List<DesignLinkDiagnostic>();

        void Report(DesignLinkDiagnosticCode code, string designComponent, string message, string? member = null) =>
            diagnostics.Add(new(code, designComponent, member, message));

        foreach (var designComponent in designSystem.Components)
        {
            var found = Find(designComponent, profile, catalog);
            if (found is null)
            {
                var asked = designComponent.Mapping?.MapsTo ?? designComponent.Name;
                Report(
                    DesignLinkDiagnosticCode.ComponentUnbound,
                    designComponent.Name,
                    $"The design-system component '{designComponent.Name}' finds no component '{asked}' in the packages of profile '{profile.Name}', so nothing renders its look.");
                continue;
            }

            var (package, name) = found.Value;
            var descriptor = components.FirstOrDefault(candidate => candidate.Component == $"{package}:{name}");
            var anatomy = descriptor?.Anatomy;
            if (anatomy is null)
            {
                Report(
                    DesignLinkDiagnosticCode.ComponentWithoutAnatomy,
                    designComponent.Name,
                    $"'{package}.{name}' renders the design-system component '{designComponent.Name}' but declares no anatomy, so it cannot take its look from the design system.");
                continue;
            }

            var property = designComponent.Mapping?.VariantProperty
                ?? anatomy.VariantProperty
                ?? WellKnownVariantProperties.FirstOrDefault(candidate => descriptor!.Properties.Contains(candidate));
            var values = designComponent.Mapping?.VariantValues ?? new Dictionary<string, string>();
            var where = $"'{package}.{name}'";

            foreach (var part in designComponent.Parts.Where(part => !anatomy.Parts.Contains(part)))
            {
                Report(DesignLinkDiagnosticCode.PartUnsupported, designComponent.Name, $"{where} does not draw the part '{part}' of '{designComponent.Name}'.", part);
            }

            var states = designComponent.Variants.SelectMany(item => (item.States ?? new Dictionary<string, IReadOnlyDictionary<string, string>>()).Keys).Distinct();
            foreach (var state in states.Where(state => !anatomy.States.Contains(state)))
            {
                Report(DesignLinkDiagnosticCode.StateUnsupported, designComponent.Name, $"{where} does not react to the state '{state}' of '{designComponent.Name}'.", state);
            }

            var variantValues = new Dictionary<string, string>(StringComparer.Ordinal);
            foreach (var item in designComponent.Variants)
            {
                var value = values.TryGetValue(item.Name, out var mapped) ? mapped : item.Name;
                variantValues[item.Name] = value;
                if (!anatomy.Variants.Contains(value))
                {
                    var asValue = value == item.Name ? string.Empty : $" (as '{value}')";
                    Report(DesignLinkDiagnosticCode.VariantUnsupported, designComponent.Name, $"{where} does not render the variant '{item.Name}' of '{designComponent.Name}'{asValue}.", item.Name);
                }
            }

            if (property is null && designComponent.Variants.Count > 1)
            {
                Report(
                    DesignLinkDiagnosticCode.VariantPropertyMissing,
                    designComponent.Name,
                    $"{where} has no property ({string.Join(" or ", WellKnownVariantProperties)}) to choose a variant of '{designComponent.Name}' by.");
            }

            links.Add(new(designComponent.Name, package, name, property, variantValues));
        }

        return new(links, diagnostics);
    }

    static (string Package, string Name)? Find(DesignComponent designComponent, UiProfile profile, IReadOnlyDictionary<string, IReadOnlyList<string>> catalog)
    {
        var mapsTo = designComponent.Mapping?.MapsTo;
        if (mapsTo is not null)
        {
            var resolved = PackageResolver.Resolve(mapsTo, profile, catalog);
            return resolved is null ? null : (resolved.Package, resolved.Name);
        }

        var wanted = Normalize(designComponent.Name);
        foreach (var package in PackageResolver.EffectivePackages(profile).Reverse())
        {
            if (catalog.TryGetValue(package, out var names) && names.FirstOrDefault(name => Normalize(name) == wanted) is { } found)
            {
                return (package, found);
            }
        }

        return null;
    }

    static string Normalize(string name) => new([.. name.Where(char.IsAsciiLetterOrDigit).Select(char.ToLowerInvariant)]);
}
