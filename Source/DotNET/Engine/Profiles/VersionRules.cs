// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Blueprints;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Describes the version rule of the shell blueprint. The TypeScript twin is <c language="csharp">describeVersionRule</c>.
/// </summary>
public static class VersionRules
{
    /// <summary>
    /// Describes the version rule of the shell blueprint: the three choices and the status chip, answered from the package resolver.
    /// </summary>
    /// <param name="pin">The stored rule; <see langword="null"/> means follow compatible versions.</param>
    /// <param name="installedVersion">The version of the blueprint that is installed.</param>
    /// <param name="latestVersion">The newest version there is, when known.</param>
    /// <returns>The choices, the one that is selected and what to say about the version.</returns>
    public static VersionRuleDescription Describe(string? pin, string installedVersion, string? latestVersion = null)
    {
        var follow = BlueprintVersionPin.DefaultPin(installedVersion);
        VersionRuleChoice[] choices =
        [
            new(VersionRuleKind.Follow, "Follow compatible versions", $"Takes updates that {follow} allows", follow),
            new(VersionRuleKind.Pin, $"Pin to {installedVersion}", "Stays on exactly this version", installedVersion),
            new(VersionRuleKind.Latest, "Always the latest", "Takes every new version, including breaking ones", "*")
        ];

        var stored = pin?.Trim() ?? string.Empty;
        var normalized = stored.StartsWith('=') ? stored[1..].Trim() : stored;
        VersionRuleKind? selected = stored.Length == 0 || stored == follow ? VersionRuleKind.Follow : normalized == installedVersion ? VersionRuleKind.Pin : stored == "*" ? VersionRuleKind.Latest : null;

        var evaluation = BlueprintVersionPin.Evaluate(pin, installedVersion, latestVersion);
        var status = evaluation.Status switch
        {
            BlueprintPinStatus.Current => new VersionRuleStatus(VersionRuleTone.Good, "Up to date"),
            BlueprintPinStatus.UpdateAvailable => new VersionRuleStatus(VersionRuleTone.Info, $"Version {latestVersion} is available and compatible"),
            BlueprintPinStatus.UpdateBlockedByPin => new VersionRuleStatus(VersionRuleTone.Warning, $"Version {latestVersion} is available but {evaluation.Pin} does not allow it"),
            _ => new VersionRuleStatus(VersionRuleTone.Bad, evaluation.Message)
        };

        return new VersionRuleDescription(choices, selected, status);
    }
}
