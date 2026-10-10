// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// Resolves typed bindings against a <see cref="BindingScope"/> with the same semantics as the TypeScript
/// <c language="csharp">resolveBindingExpression</c>; both run <c language="csharp">binding-resolution-fixtures.json</c>.
/// </summary>
public static class BindingResolver
{
    /// <summary>
    /// Resolves a binding.
    /// </summary>
    /// <param name="binding">The binding.</param>
    /// <param name="scope">The values available.</param>
    /// <returns>The resolved value.</returns>
    public static BindingValue Resolve(BindingExpression binding, BindingScope scope)
    {
        var kind = binding.Kind ?? BindingSourceKind.DataContext;
        var value = kind == BindingSourceKind.Literal ? LiteralValue(binding.Value) : ReadPath(Source(binding, scope, kind), SourcePath(binding, kind));
        if (!value.IsNullOrAbsent) return value;

        return binding.NullBehavior switch
        {
            BindingNullBehavior.Preserve => BindingValue.Absent,
            BindingNullBehavior.Clear => BindingValue.Null,
            _ => value
        };
    }

    static BindingValue Source(BindingExpression binding, BindingScope scope, BindingSourceKind kind)
    {
        switch (kind)
        {
            case BindingSourceKind.DataContext:
                return scope.DataContext is null ? BindingValue.Absent : BindingValue.Of(scope.DataContext);
            case BindingSourceKind.QueryResult:
                return !string.IsNullOrEmpty(binding.Query) && scope.QueryResults is not null && scope.QueryResults.TryGetValue(binding.Query, out var result)
                    ? BindingValue.Of(result)
                    : BindingValue.Absent;
            case BindingSourceKind.ComponentProperty:
                return !string.IsNullOrEmpty(binding.ComponentId) && scope.ComponentOutputs is not null && scope.ComponentOutputs.TryGetValue(binding.ComponentId, out var outputs)
                    ? BindingValue.Of(outputs)
                    : BindingValue.Absent;
            default:
                return BindingValue.Absent;
        }
    }

    static string SourcePath(BindingExpression binding, BindingSourceKind kind) =>
        kind == BindingSourceKind.ComponentProperty ? binding.ComponentPropertyPath ?? binding.Path : binding.Path;

    static BindingValue LiteralValue(object? value) => value switch
    {
        null => BindingValue.Absent,
        JsonElement { ValueKind: JsonValueKind.Null or JsonValueKind.Undefined } => BindingValue.Absent,
        JsonElement element => BindingValue.Of(JsonNode.Parse(element.GetRawText())),
        JsonNode node => BindingValue.Of(node.DeepClone()),
        _ => BindingValue.Of(JsonSerializer.SerializeToNode(value))
    };

    static BindingValue ReadPath(BindingValue source, string? path)
    {
        if (string.IsNullOrEmpty(path)) return source;

        var current = source;
        foreach (var segment in path.Split('.'))
        {
            current = current.Node switch
            {
                JsonArray array when IsIndex(segment) && int.TryParse(segment, out var index) && index < array.Count => BindingValue.Of(array[index]),
                JsonObject obj when obj.TryGetPropertyValue(segment, out var property) => BindingValue.Of(property),
                _ => BindingValue.Absent
            };
        }

        return current;
    }

    static bool IsIndex(string segment) =>
        segment.Length > 0 && segment.All(char.IsAsciiDigit) && (segment == "0" || segment[0] != '0');
}
