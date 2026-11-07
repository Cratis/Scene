// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// An entry of a menu: an action shown as a line of a menu rather than as a button.
/// </summary>
public record OutletMenuEntry : OutletAction
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.MenuEntry;
}
