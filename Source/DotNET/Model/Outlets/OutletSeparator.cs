// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A separator between actions.
/// </summary>
public record OutletSeparator : OutletItem
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Separator;
}
