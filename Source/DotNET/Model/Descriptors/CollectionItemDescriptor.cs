// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// What the items of a collection property look like.
/// </summary>
/// <param name="Properties">The item fields.</param>
/// <param name="Label">A name for one item.</param>
/// <param name="Open">Whether fields not described are allowed.</param>
/// <param name="Positional">Whether items have no id and are told apart by position.</param>
public record CollectionItemDescriptor(
    IReadOnlyList<PropertyDescriptor> Properties,
    string? Label = null,
    bool? Open = null,
    bool? Positional = null);
