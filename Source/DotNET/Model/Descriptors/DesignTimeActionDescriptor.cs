// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// An action offered while designing a component.
/// </summary>
/// <param name="Id">The action.</param>
/// <param name="Label">What the author sees.</param>
/// <param name="Placement">Where it is offered.</param>
/// <param name="Availability">A named rule for when it is available.</param>
/// <param name="Description">What it does.</param>
public record DesignTimeActionDescriptor(
    string Id,
    string Label,
    DesignTimeActionPlacement? Placement = null,
    string? Availability = null,
    string? Description = null);
