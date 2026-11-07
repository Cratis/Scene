// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A group of actions shown as one menu, such as "More". It holds buttons, menu entries and separators, never another group.
/// </summary>
public record OutletGroup : OutletItem
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Group;

    /// <summary>Gets the text of the menu.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the qualified icon reference, when the group has one.</summary>
    public string? Icon { get; init; }

    /// <summary>Gets the actions in the group, in order.</summary>
    public IReadOnlyList<OutletItem> Items { get; init; } = [];
}
