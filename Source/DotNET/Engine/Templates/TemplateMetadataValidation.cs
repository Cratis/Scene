// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Checks that a template carries the compatibility, attribution and license metadata every shipped template
/// needs, and that each value is well formed. The TypeScript engine (<c language="csharp">validateTemplateMetadata</c>) reports
/// the same problems in the same order; both are asserted against <c language="csharp">template-metadata-fixtures.json</c>.
/// </summary>
public static class TemplateMetadataValidation
{
    /// <summary>
    /// Validates one template's metadata.
    /// </summary>
    /// <param name="name">The template's name.</param>
    /// <param name="metadata">The template's metadata, if any.</param>
    /// <returns>The problems found.</returns>
    public static IReadOnlyList<string> Validate(string name, TemplateMetadata? metadata)
    {
        var problems = new List<string>();
        var compatibility = metadata?.Compatibility;

        if (compatibility is null)
        {
            problems.Add($"Template '{name}' declares no compatibility");
        }
        else
        {
            if (string.IsNullOrWhiteSpace(compatibility.Scene))
            {
                problems.Add($"Template '{name}' declares no Scene version range");
            }
            else if (!PackageVersionRange.IsValidRange(compatibility.Scene))
            {
                problems.Add($"Template '{name}' declares an invalid Scene version range '{compatibility.Scene}'");
            }

            foreach (var requirement in compatibility.Packages ?? [])
            {
                if (string.IsNullOrWhiteSpace(requirement.Name))
                {
                    problems.Add($"Template '{name}' declares a package requirement without a name");
                }
                else if (!PackageVersionRange.IsValidRange(requirement.VersionRange))
                {
                    problems.Add($"Template '{name}' declares an invalid version range '{requirement.VersionRange}' for package '{requirement.Name}'");
                }
            }
        }

        var attribution = metadata?.Attribution;
        if (string.IsNullOrWhiteSpace(attribution?.Author))
        {
            problems.Add($"Template '{name}' declares no author");
        }

        if (attribution?.Url is not null && !TemplateMetadataRules.IsAbsoluteHttpsUrl(attribution.Url))
        {
            problems.Add($"Template '{name}' declares an attribution URL '{attribution.Url}' that is not an absolute https URL");
        }

        if (string.IsNullOrWhiteSpace(metadata?.License))
        {
            problems.Add($"Template '{name}' declares no license");
        }
        else if (!TemplateMetadataRules.IsSpdxExpression(metadata.License))
        {
            problems.Add($"Template '{name}' declares '{metadata.License}', which is not an SPDX license expression");
        }

        if (metadata?.LicenseUrl is not null && !TemplateMetadataRules.IsAbsoluteHttpsUrl(metadata.LicenseUrl))
        {
            problems.Add($"Template '{name}' declares a license URL '{metadata.LicenseUrl}' that is not an absolute https URL");
        }

        return problems;
    }
}
