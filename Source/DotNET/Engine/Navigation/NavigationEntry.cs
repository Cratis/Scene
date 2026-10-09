// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// One place in the model a user can navigate from, reduced to its stable identity and destination.
/// </summary>
/// <param name="Destination">Where the entry takes the user.</param>
/// <param name="Id">Stable identity used to point at the entry in diagnostics.</param>
public record NavigationEntry(DestinationReference Destination, string? Id = null);
