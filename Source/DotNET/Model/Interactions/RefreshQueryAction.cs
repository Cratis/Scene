// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Re-runs a query-backed element.
/// </summary>
/// <param name="Query">The query to re-run.</param>
public record RefreshQueryAction(string Query) : InteractionAction;
