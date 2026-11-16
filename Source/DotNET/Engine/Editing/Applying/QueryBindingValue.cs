// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// A query binding as it was written into a property: which query, its arguments and where its results go, read as leniently as
/// the TypeScript engine reads it.
/// </summary>
/// <param name="QueryId">The id of the query.</param>
/// <param name="Query">The name of the query.</param>
/// <param name="Arguments">The arguments.</param>
/// <param name="Results">Where the results go.</param>
sealed record QueryBindingValue(string QueryId, string Query, IReadOnlyList<QueryBindingValue.Argument> Arguments, IReadOnlyList<QueryBindingValue.Result> Results)
{
    /// <summary>
    /// Reads a binding from a value.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>The binding.</returns>
    public static QueryBindingValue Read(JsonNode value) => new(
        Data.Text(value, "queryId") ?? "undefined",
        Data.Text(value, "query") ?? "undefined",
        [.. Data.List(value, "arguments").Select(argument => new Argument(Data.Text(argument, "parameter") ?? "undefined", Data.Text(Data.Get(argument, "source"), "path") ?? "undefined"))],
        [.. Data.List(value, "results").Select(result => new Result(Data.Text(result, "field") ?? "undefined"))]);

    /// <summary>
    /// One argument of a bound query.
    /// </summary>
    /// <param name="Parameter">The parameter it is for.</param>
    /// <param name="SourcePath">The path of what supplies it.</param>
    internal sealed record Argument(string Parameter, string SourcePath);

    /// <summary>
    /// One result of a bound query.
    /// </summary>
    /// <param name="Field">The result field.</param>
    internal sealed record Result(string Field);
}
