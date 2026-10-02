// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Works out, for every instance in a chain, which properties it may configure. An owner's exposure reaches the instance
/// directly inside it. It reaches further only through an explicit re-exposure by every level in between, and each re-exposure
/// can only narrow what it passes on. The twin of the TypeScript engine's computeExposureGrants, without the descriptors: a
/// server checks what was exposed to whom, and leaves what a property's value must look like to the descriptors that own it.
/// </summary>
sealed class ExposureGrants
{
    readonly Dictionary<string, Dictionary<(string Component, string Path), ExposureGrant>> _byInstance = [];

    ExposureGrants()
    {
    }

    /// <summary>
    /// Works out who may configure what in a chain.
    /// </summary>
    /// <param name="chain">The chain, outermost first.</param>
    /// <returns>The grants.</returns>
    public static ExposureGrants Compute(IReadOnlyList<TemplateChainLevel> chain)
    {
        var grants = new ExposureGrants();
        foreach (var level in chain)
        {
            grants._byInstance[level.Instance] = [];
        }

        for (var ownerLevel = 0; ownerLevel < chain.Count; ownerLevel++)
        {
            var owner = chain[ownerLevel];
            foreach (var exposure in owner.Exposures.Where(candidate => candidate.ReExposes is null && owner.Components.ContainsKey(candidate.Component)))
            {
                var current = new ExposureGrant(exposure.Component, exposure.Path, owner.Owner, [.. (exposure.Operations ?? []).Distinct()], exposure.EditableFields);
                for (var contributor = ownerLevel + 1; contributor < chain.Count; contributor++)
                {
                    grants._byInstance[chain[contributor].Instance][(exposure.Component, exposure.Path)] = current;

                    var reExposure = chain[contributor].Exposures.FirstOrDefault(candidate =>
                        candidate.ReExposes == owner.Owner && candidate.Component == exposure.Component && candidate.Path == exposure.Path);
                    if (reExposure is null)
                    {
                        break;
                    }

                    current = current.Narrow(reExposure);
                }
            }
        }

        return grants;
    }

    /// <summary>
    /// Finds what an instance may do to a property.
    /// </summary>
    /// <param name="instance">The id of the instance.</param>
    /// <param name="component">The id of the component.</param>
    /// <param name="path">The path of the property.</param>
    /// <returns>The grant, or <see langword="null"/> when the property was not exposed to the instance.</returns>
    public ExposureGrant? Find(string instance, string component, string path) =>
        _byInstance.TryGetValue(instance, out var grants) && grants.TryGetValue((component, path), out var grant) ? grant : null;
}
