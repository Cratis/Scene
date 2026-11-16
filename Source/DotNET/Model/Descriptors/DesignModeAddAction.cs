// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Icons;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// An action that adds to a component in design mode.
/// </summary>
/// <param name="Id">The action.</param>
/// <param name="Label">What the author sees.</param>
/// <param name="Icon">Its icon.</param>
/// <param name="CollectionPath">The collection it adds to.</param>
public record DesignModeAddAction(
    string Id,
    string Label,
    IconReference? Icon = null,
    string? CollectionPath = null);
