// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Icons;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// An action on one item of a component in design mode.
/// </summary>
/// <param name="Id">The action.</param>
/// <param name="Icon">Its icon.</param>
/// <param name="Title">What the author sees.</param>
/// <param name="Compact">Whether it is shown compactly.</param>
/// <param name="Availability">A named rule for when it is available.</param>
/// <param name="ReadOnlyReason">Why it is unavailable when the item is read-only.</param>
public record DesignModeItemAction(
    string Id,
    IconReference Icon,
    string Title,
    bool? Compact = null,
    string? Availability = null,
    string? ReadOnlyReason = null);
