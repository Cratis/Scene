// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// How a component is designed in place.
/// </summary>
/// <param name="AddActions">The actions that add.</param>
/// <param name="ItemToolbar">The actions on an item.</param>
/// <param name="ItemsPath">The collection of the items.</param>
public record ComponentDesignModeDescriptor(
    IReadOnlyList<DesignModeAddAction> AddActions,
    IReadOnlyList<DesignModeItemAction> ItemToolbar,
    string? ItemsPath = null);
