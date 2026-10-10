// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// Keeps the results of bound queries as their arguments change, accepting a result only for the latest run of its
/// query so a stale answer never overwrites the current one. Behaves like the TypeScript <c language="csharp">QueryBindingState</c>.
/// </summary>
public class QueryBindingState
{
    readonly Dictionary<string, int> _generations = new(StringComparer.Ordinal);
    readonly Dictionary<string, JsonNode?> _results = new(StringComparer.Ordinal);

    /// <summary>
    /// Gets the accepted results, as the query results of a binding scope.
    /// </summary>
    public IReadOnlyDictionary<string, JsonNode?> QueryResults => _results;

    /// <summary>
    /// Starts a run of a query with new arguments, invalidating every earlier run of that query.
    /// </summary>
    /// <param name="query">The query binding name.</param>
    /// <returns>The run's ticket.</returns>
    public QueryBindingTicket Begin(string query)
    {
        var generation = _generations.GetValueOrDefault(query) + 1;
        _generations[query] = generation;
        return new(query, generation);
    }

    /// <summary>
    /// Records a run's result.
    /// </summary>
    /// <param name="ticket">The run's ticket.</param>
    /// <param name="result">The result.</param>
    /// <returns><see langword="false"/>, keeping the current result, when the run is stale.</returns>
    public bool Complete(QueryBindingTicket ticket, JsonNode? result)
    {
        if (_generations.GetValueOrDefault(ticket.Query) != ticket.Generation) return false;
        _results[ticket.Query] = result;
        return true;
    }

    /// <summary>
    /// Removes a query's result and invalidates any run still in flight.
    /// </summary>
    /// <param name="query">The query binding name.</param>
    public void Clear(string query)
    {
        _generations[query] = _generations.GetValueOrDefault(query) + 1;
        _results.Remove(query);
    }
}
