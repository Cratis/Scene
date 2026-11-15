// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// A query bound to a property: which query, its arguments and where its results go.
/// </summary>
/// <param name="QueryId">The id of the query.</param>
/// <param name="Query">The name of the query.</param>
/// <param name="Arguments">Its arguments.</param>
/// <param name="Results">Where its results go.</param>
public record QueryBinding(
    string QueryId,
    string Query,
    IReadOnlyList<QueryArgumentBinding> Arguments,
    IReadOnlyList<QueryResultBinding> Results);
