// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Validates sample-data packs, an application's selection and what packages ship. Reports the same problems in the same order as
/// the TypeScript engine (<c language="csharp">validateSampleDataPack</c>, <c language="csharp">validateSampleDataSelection</c>,
/// <c language="csharp">validateSampleDataPackages</c>); both are asserted against <c language="csharp">sample-data-resolution-fixtures.json</c>.
/// </summary>
public static class SampleDataValidation
{
    /// <summary>
    /// Checks a pack's schema: an id of the allowed form, a title, a well-formed locale tag, an owner that is
    /// <c language="csharp">user</c> or <c language="csharp">blueprint:&lt;id&gt;</c>, and sets with a shape each, none repeated.
    /// </summary>
    /// <param name="pack">The pack.</param>
    /// <returns>The problems; empty when valid.</returns>
    public static IReadOnlyList<string> ValidatePack(SampleDataPack pack)
    {
        var problems = new List<string>();
        var id = pack.Id ?? string.Empty;
        var label = string.IsNullOrWhiteSpace(id) ? "Sample data pack" : $"Sample data pack '{id}'";

        if (string.IsNullOrWhiteSpace(id))
        {
            problems.Add("Sample data pack declares no id");
        }
        else if (!SampleDataRules.IsValidId(id))
        {
            problems.Add($"{label} declares an invalid id; use lower-case letters, digits and '.', '_' or '-' separators");
        }

        if (string.IsNullOrWhiteSpace(pack.Title))
        {
            problems.Add($"{label} declares no title");
        }

        if (string.IsNullOrWhiteSpace(pack.Locale))
        {
            problems.Add($"{label} declares no locale");
        }
        else if (!SampleDataRules.IsValidLocale(pack.Locale))
        {
            problems.Add($"{label} declares an invalid locale '{pack.Locale}'");
        }

        if (!SampleDataRules.IsValidOwner(pack.Owner))
        {
            problems.Add($"{label} declares owner '{pack.Owner ?? string.Empty}', which is neither 'user' nor 'blueprint:<id>'");
        }

        var seen = new HashSet<string>();
        foreach (var set in pack.Sets ?? [])
        {
            if (string.IsNullOrWhiteSpace(set.Shape))
            {
                problems.Add($"{label} declares a set without a shape");
            }
            else if (!seen.Add(set.Shape))
            {
                problems.Add($"{label} declares shape '{set.Shape}' more than once");
            }
        }

        return problems;
    }

    /// <summary>
    /// Checks an application's sample data selection (the UI profile's <c language="csharp">SampleData</c>) against the packs available: the
    /// active pack and every bound pack must exist, mappings and bindings must be complete and not repeated, and one read model
    /// must not be fed by two different shapes.
    /// </summary>
    /// <param name="selection">The selection.</param>
    /// <param name="packs">The packs available.</param>
    /// <returns>The problems; empty when valid.</returns>
    public static IReadOnlyList<string> ValidateSelection(SampleDataSelection selection, IReadOnlyList<SampleDataPack> packs)
    {
        var problems = new List<string>();
        var known = new HashSet<string>(packs.Select(pack => pack.Id));

        if (selection.ActivePack is not null && !known.Contains(selection.ActivePack))
        {
            problems.Add($"The active sample data pack '{selection.ActivePack}' is not available");
        }

        var pairs = new HashSet<string>();
        var shapeByReadModel = new Dictionary<string, string>();
        foreach (var mapping in selection.Mappings ?? [])
        {
            if (string.IsNullOrWhiteSpace(mapping.Shape))
            {
                problems.Add("A sample data mapping declares no shape");
            }
            else if (string.IsNullOrWhiteSpace(mapping.ReadModel))
            {
                problems.Add($"The sample data mapping for shape '{mapping.Shape}' declares no read model");
            }
            else if (!pairs.Add($"{mapping.Shape}\u0000{mapping.ReadModel}"))
            {
                problems.Add($"The sample data mapping '{mapping.Shape}' to '{mapping.ReadModel}' is declared more than once");
            }
            else if (shapeByReadModel.TryGetValue(mapping.ReadModel, out var existing))
            {
                problems.Add($"The read model '{mapping.ReadModel}' is mapped from both shape '{existing}' and shape '{mapping.Shape}'");
            }
            else
            {
                shapeByReadModel[mapping.ReadModel] = mapping.Shape;
            }
        }

        var targets = new HashSet<string>();
        foreach (var binding in selection.Bindings ?? [])
        {
            if (string.IsNullOrWhiteSpace(binding.Target))
            {
                problems.Add("A sample data binding declares no target");
            }
            else if (!targets.Add(binding.Target))
            {
                problems.Add($"The sample data target '{binding.Target}' is bound more than once");
            }
            else if (!known.Contains(binding.Pack ?? string.Empty))
            {
                problems.Add($"The sample data binding for '{binding.Target}' names pack '{binding.Pack ?? string.Empty}', which is not available");
            }
        }

        return problems;
    }

    /// <summary>
    /// Checks the sample data the given packages ship, in package then reference order: only a Blueprint package may ship packs;
    /// each reference needs a valid id, a title, a locale tag and a <c language="csharp">sampleData/*.json</c> path, with no id or path
    /// repeated; and each loaded pack must be valid, match its reference's id and locale, be owned by a blueprint, and be one the
    /// manifest references.
    /// </summary>
    /// <param name="sources">The packages and their loaded packs.</param>
    /// <returns>The problems; empty when valid.</returns>
    public static IReadOnlyList<string> ValidatePackages(IReadOnlyList<SampleDataPackSource> sources)
    {
        var problems = new List<string>();

        foreach (var source in sources)
        {
            var manifest = source.Manifest;
            var references = manifest.SampleData ?? [];
            var owner = $"Package '{manifest.Name}'";

            if (references.Count > 0 && manifest.Kind != PackageKind.Blueprint)
            {
                problems.Add($"{owner} ships sample data but is not a Blueprint package");
            }

            var ids = new HashSet<string>();
            var paths = new HashSet<string>();
            foreach (var reference in references)
            {
                var label = $"{owner} sample data pack '{reference.Id ?? string.Empty}'";
                if (string.IsNullOrWhiteSpace(reference.Id))
                {
                    problems.Add($"{owner} declares a sample data pack without an id");
                }
                else if (!SampleDataRules.IsValidId(reference.Id))
                {
                    problems.Add($"{label} has an invalid id");
                }
                else if (!ids.Add(reference.Id))
                {
                    problems.Add($"{label} is declared more than once");
                }

                if (string.IsNullOrWhiteSpace(reference.Title))
                {
                    problems.Add($"{label} declares no title");
                }

                if (string.IsNullOrWhiteSpace(reference.Locale))
                {
                    problems.Add($"{label} declares no locale");
                }
                else if (!SampleDataRules.IsValidLocale(reference.Locale))
                {
                    problems.Add($"{label} declares an invalid locale '{reference.Locale}'");
                }

                if (!SampleDataRules.IsValidPath(reference.Path))
                {
                    problems.Add($"{label} declares path '{reference.Path ?? string.Empty}', which is not 'sampleData/<name>.json'");
                }
                else if (!paths.Add(reference.Path))
                {
                    problems.Add($"{label} reuses the path '{reference.Path}'");
                }
            }

            foreach (var pack in source.Packs ?? [])
            {
                var label = $"{owner} sample data pack '{pack.Id ?? string.Empty}'";
                problems.AddRange(ValidatePack(pack));
                var reference = references.FirstOrDefault(candidate => candidate.Id == pack.Id);
                if (reference is null)
                {
                    problems.Add($"{label} is not referenced by the package's sampleData");
                    continue;
                }

                if (reference.Locale != pack.Locale)
                {
                    problems.Add($"{label} has locale '{pack.Locale}' but its reference declares '{reference.Locale}'");
                }

                if (SampleDataRules.IsValidOwner(pack.Owner) && pack.Owner == SampleDataRules.UserOwner)
                {
                    problems.Add($"{label} must be owned by a blueprint, not 'user'");
                }
            }
        }

        return problems;
    }
}
