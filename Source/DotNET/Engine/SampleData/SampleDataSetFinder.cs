// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Finds the set of a pack that supplies rows for a read model or shape.
/// </summary>
public static class SampleDataSetFinder
{
    /// <summary>
    /// Finds the set: an explicit mapping whose read model is the target wins; otherwise a set whose shape has the target's name
    /// (compared exactly, case-sensitively).
    /// </summary>
    /// <param name="pack">The pack.</param>
    /// <param name="target">The read model or shape name.</param>
    /// <param name="mappings">The shape-to-read-model mappings.</param>
    /// <returns>The set, or null when the pack has none.</returns>
    public static SampleDataSet? Find(SampleDataPack pack, string target, IReadOnlyList<SampleDataMapping>? mappings = null)
    {
        var sets = pack.Sets ?? [];
        foreach (var mapping in mappings ?? [])
        {
            if (mapping.ReadModel != target)
            {
                continue;
            }

            var mapped = sets.FirstOrDefault(set => set.Shape == mapping.Shape);
            if (mapped is not null)
            {
                return mapped;
            }
        }

        return sets.FirstOrDefault(set => set.Shape == target);
    }
}
