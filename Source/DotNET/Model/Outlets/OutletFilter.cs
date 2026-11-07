// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A filter of an outlet of filters: Screenplay's <c language="screenplay">filter &lt;id&gt; title "…" sets &lt;query&gt;.&lt;parameter&gt;</c>.
/// </summary>
public record OutletFilter : OutletItem
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Filter;

    /// <summary>Gets the label of the filter.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the control the filter shows; the parameter's type decides when absent.</summary>
    public FilterControl? Control { get; init; }

    /// <summary>Gets the query parameter the filter sets.</summary>
    public QueryParameterReference? Sets { get; init; }
}
