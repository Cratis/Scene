// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A stat of an outlet of stats: Screenplay's <c language="screenplay">stat &lt;id&gt; title "…" value from &lt;query&gt;.&lt;field&gt;</c>.
/// </summary>
public record OutletStat : OutletItem
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Stat;

    /// <summary>Gets the label of the stat.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the field of a single-result query the stat shows.</summary>
    public QueryFieldReference? ValueFrom { get; init; }

    /// <summary>Gets the field the stat's trend comes from, when it shows one.</summary>
    public QueryFieldReference? Trend { get; init; }
}
