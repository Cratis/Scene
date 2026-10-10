// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// Identifies one run of a bound query, issued when the run starts.
/// </summary>
/// <param name="Query">The query binding name.</param>
/// <param name="Generation">The run's generation; only the latest is accepted.</param>
public record QueryBindingTicket(string Query, int Generation);
