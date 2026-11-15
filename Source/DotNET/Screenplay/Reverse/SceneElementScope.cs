// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse;

sealed class SceneElementScope(SceneScreenNames names, SceneTransportGaps gaps, bool includeNative = true)
{
    readonly HashSet<string> _names = [with(StringComparer.Ordinal)];

    public SceneScreenNames Names { get; } = names;

    public SceneTransportGaps Gaps { get; } = gaps;

    /// <summary>
    /// Whether what a document kept natively is woven back in. The typed round trip is proven without it.
    /// </summary>
    public bool IncludeNative { get; } = includeNative;

    public string UniqueName(string name)
    {
        var identifier = ScreenplayIdentifier.From(name);
        var unique = identifier;
        for (var suffix = 2; !_names.Add(unique); suffix++)
        {
            unique = $"{identifier}_{suffix}";
        }

        return unique;
    }
}
