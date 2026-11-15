// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// A query a property may be bound to, as the host discovered it.
/// </summary>
/// <param name="Id">The id.</param>
/// <param name="Name">The name.</param>
/// <param name="Origin">Where it comes from.</param>
/// <param name="Parameters">Its parameters.</param>
/// <param name="ResultShape">The shape it returns.</param>
/// <param name="ResultFields">The fields it returns.</param>
public record QueryCandidate(
    string Id,
    string Name,
    IReadOnlyList<QueryOrigin> Origin,
    IReadOnlyList<QueryParameter> Parameters,
    QueryResultShape ResultShape,
    IReadOnlyList<QueryResultField> ResultFields);
