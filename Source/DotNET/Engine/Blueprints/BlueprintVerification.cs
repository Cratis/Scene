// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Engine.SampleData;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The definition of done for a blueprint (spec Part B 6), as rules a package can be held to: valid manifest and version; for a domain
/// blueprint its domain, description, thumbnail and screen set; every template with complete metadata, a category, a type from the
/// vocabulary, a description and a thumbnail; every template placed by the slot resolver, with nothing unplaced, ambiguous or nested in
/// itself (ambiguity is only a problem for a domain blueprint: the foundation's generic nesting chain fits slots many templates declare, and is
/// chosen explicitly); sample data present, locale-tagged and valid; and a dependency on the foundation set. Reports the same problems in the same
/// order as the TypeScript engine (<c language="csharp">verifyBlueprintPackage</c>); both are asserted against
/// <c language="csharp">blueprint-verification-fixtures.json</c>.
/// </summary>
public static class BlueprintVerification
{
    /// <summary>
    /// Verifies a blueprint package.
    /// </summary>
    /// <param name="source">The blueprint to verify.</param>
    /// <param name="library">The other packages available - above all the foundation set - so templates can be placed into its layouts and checked against its versions.</param>
    /// <param name="options">How strictly to verify.</param>
    /// <returns>The problems; empty when the blueprint is done.</returns>
    public static IReadOnlyList<string> Verify(BlueprintSource source, IReadOnlyList<TemplateSource>? library = null, BlueprintVerificationOptions? options = null)
    {
        library ??= [];
        options ??= new();
        var manifest = source.Manifest;
        var label = $"Blueprint '{manifest.Name}'";

        if (manifest.Kind != PackageKind.Blueprint)
        {
            return [$"Package '{manifest.Name}' is not a Blueprint package"];
        }

        var problems = VersionProblems(label, manifest);
        var blueprint = manifest.Blueprint;
        var domain = blueprint is not null;
        problems.AddRange(BlueprintProblems(source, library, label, options));

        problems.AddRange(SampleDataValidation.ValidatePackages([new SampleDataPackSource(manifest, source.Packs)]));
        problems.AddRange(BlueprintMetadataVerification.SampleDataFileProblems(source, label));
        problems.AddRange(BlueprintTemplateVerification.Problems(source, library, domain));
        problems.AddRange(BlueprintPlacementVerification.Problems(source, library, label, domain));
        return problems;
    }

    static List<string> VersionProblems(string label, ScenePackage manifest) =>
        PackageVersionRange.IsValidVersion(manifest.Version) ? [] : [$"{label} declares an invalid version '{manifest.Version ?? string.Empty}'"];

    static List<string> BlueprintProblems(BlueprintSource source, IReadOnlyList<TemplateSource> library, string label, BlueprintVerificationOptions options)
    {
        if (source.Manifest.Blueprint is null)
        {
            return options.RequireBlueprintMetadata ? [$"{label} declares no blueprint metadata (domain, description, thumbnail and screen set)"] : [];
        }

        var available = (source.ScreenTemplates ?? []).Concat(library.SelectMany(other => other.ScreenTemplates ?? [])).Select(template => template.Name).ToHashSet(StringComparer.Ordinal);
        var foundation = options.FoundationPackage ?? BlueprintRules.FoundationPackageName;
        return BlueprintMetadataVerification.Problems(source, label, available, foundation);
    }
}
