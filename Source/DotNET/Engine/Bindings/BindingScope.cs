// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// Runtime values available to resolve typed bindings.
/// </summary>
/// <param name="DataContext">The inherited effective data context.</param>
/// <param name="QueryResults">Query results keyed by the model's query binding name; a key with a null value is a present null.</param>
/// <param name="ComponentOutputs">Component output properties keyed by stable element id.</param>
public record BindingScope(
    JsonNode? DataContext = null,
    IReadOnlyDictionary<string, JsonNode?>? QueryResults = null,
    IReadOnlyDictionary<string, JsonObject>? ComponentOutputs = null)
{
    /// <summary>
    /// The scope a nested template or region sees: its own data context replaces the inherited one, and its query results
    /// and component outputs shadow the inherited ones of the same name. Matches TypeScript <c language="csharp">nestBindingScope</c>.
    /// </summary>
    /// <param name="nested">What the nested scope declares.</param>
    /// <returns>The nested scope.</returns>
    public BindingScope Nest(BindingScope nested) => new(
        nested.DataContext ?? DataContext,
        Merge(QueryResults, nested.QueryResults),
        Merge(ComponentOutputs, nested.ComponentOutputs));

    /// <summary>
    /// The scope after elements leave the tree; their outputs are removed. Matches TypeScript <c language="csharp">removeComponentOutputs</c>.
    /// </summary>
    /// <param name="elementIds">The ids of the elements that left.</param>
    /// <returns>The scope without their outputs.</returns>
    public BindingScope WithoutComponentOutputs(IEnumerable<string> elementIds)
    {
        var removed = elementIds.ToHashSet(StringComparer.Ordinal);
        return this with
        {
            ComponentOutputs = (ComponentOutputs ?? new Dictionary<string, JsonObject>())
                .Where(entry => !removed.Contains(entry.Key))
                .ToDictionary(entry => entry.Key, entry => entry.Value, StringComparer.Ordinal)
        };
    }

    static Dictionary<string, T> Merge<T>(IReadOnlyDictionary<string, T>? parent, IReadOnlyDictionary<string, T>? nested)
    {
        var merged = new Dictionary<string, T>(parent ?? new Dictionary<string, T>(), StringComparer.Ordinal);
        foreach (var (key, value) in nested ?? new Dictionary<string, T>())
        {
            merged[key] = value;
        }

        return merged;
    }
}
