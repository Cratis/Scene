// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// Decides whether "update available" applies to a template reference that pins a blueprint version. A reference without a pin is held to
/// <see cref="DefaultPin"/> of the installed version. The pin says which versions the reference is content to run against; the installed
/// version must satisfy it, and a newer available version is an update - an ordinary one when the pin allows it, one the pin blocks (usually a major version) when it
/// does not. Evaluates exactly as the TypeScript engine (<c language="csharp">evaluateBlueprintPin</c>) does; both are asserted against
/// <c language="csharp">blueprint-verification-fixtures.json</c>.
/// </summary>
public static class BlueprintVersionPin
{
    /// <summary>
    /// The pin a reference gets when a template is chosen from a blueprint: the caret range of the installed version, so the reference
    /// accepts every compatible update and refuses a new major version until someone moves it on purpose.
    /// </summary>
    /// <param name="installedVersion">The installed version.</param>
    /// <returns>The pin.</returns>
    public static string DefaultPin(string installedVersion) => $"^{installedVersion}";

    /// <summary>
    /// Evaluates a pin.
    /// </summary>
    /// <param name="pin">The reference's version range, or null when it has none.</param>
    /// <param name="installedVersion">The version of the blueprint that is installed.</param>
    /// <param name="latestVersion">The newest version of the blueprint that is available; when null only the installed version is known.</param>
    /// <returns>The evaluation.</returns>
    public static BlueprintPinEvaluation Evaluate(string? pin, string installedVersion, string? latestVersion = null)
    {
        var effective = string.IsNullOrWhiteSpace(pin) ? DefaultPin(installedVersion) : pin.Trim();

        if (!PackageVersionRange.IsValidVersion(installedVersion))
        {
            return new(BlueprintPinStatus.Invalid, effective, $"Installed version '{installedVersion}' is not a version");
        }

        if (!PackageVersionRange.IsValidRange(effective))
        {
            return new(BlueprintPinStatus.Invalid, effective, $"Pin '{effective}' is not a version range");
        }

        if (latestVersion is not null && !PackageVersionRange.IsValidVersion(latestVersion))
        {
            return new(BlueprintPinStatus.Invalid, effective, $"Latest version '{latestVersion}' is not a version");
        }

        if (!PackageVersionRange.IsSatisfiedBy(installedVersion, effective))
        {
            return new(BlueprintPinStatus.NotSatisfied, effective, $"Version {installedVersion} is installed but the reference pins {effective}");
        }

        if (latestVersion is null || PackageVersionRange.CompareVersions(latestVersion, installedVersion) <= 0)
        {
            return new(BlueprintPinStatus.Current, effective, $"Version {installedVersion} is the latest");
        }

        return PackageVersionRange.IsSatisfiedBy(latestVersion, effective)
            ? new(BlueprintPinStatus.UpdateAvailable, effective, $"Version {latestVersion} is available, and {effective} allows it")
            : new(BlueprintPinStatus.UpdateBlockedByPin, effective, $"Version {latestVersion} is available but {effective} does not allow it");
    }
}
