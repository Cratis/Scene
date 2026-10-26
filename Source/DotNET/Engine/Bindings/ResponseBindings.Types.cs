// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;

namespace Cratis.Scene.Engine.Bindings;

public static partial class ResponseBindings
{
    /// <summary>Projects a scalar, object or whole array member through own object properties.</summary>
    /// <param name="type">The command's response value type.</param>
    /// <param name="path">The dotted member path; empty selects a scalar or object response.</param>
    /// <returns>The projected type, or null for an unsupported path.</returns>
    public static ResponseValueType? ProjectType(ResponseValueType type, string path)
    {
        if (path.Length == 0) return RootType(type);
        var selected = type;
        foreach (var segment in path.Split('.'))
        {
            var property = MemberType(selected, segment);
            if (property is null) return null;
            selected = NullableProjection(selected, property);
        }
        return selected;
    }

    /// <summary>Checks recursive structural compatibility without coercion.</summary>
    /// <param name="source">The projected response type.</param>
    /// <param name="target">The actual destination type.</param>
    /// <returns>Whether the destination accepts every value of the source type.</returns>
    public static bool IsAssignable(ResponseValueType source, ResponseValueType target)
    {
        if (source.Nullable && !target.Nullable) return false;
        if (source.Kind != target.Kind) return false;
        return AssignableContents(source, target);
    }

    static ResponseValueType? RootType(ResponseValueType type) => type.Kind == "array" ? null : type;
    static ResponseValueType NullableProjection(ResponseValueType parent, ResponseValueType property) => property with { Nullable = parent.Nullable || property.Nullable };

    static bool AssignableContents(ResponseValueType source, ResponseValueType target) => source.Kind switch
    {
        "object" => ObjectAssignable(source, target),
        "array" => ArrayAssignable(source, target),
        _ => IsPrimitive(source.Kind)
    };

    static bool IsPrimitive(string kind) => kind == "string" || kind == "number" || kind == "boolean";

    static bool ObjectAssignable(ResponseValueType source, ResponseValueType target)
    {
        if (target.Properties is null || source.Properties is null) return false;
        return target.Properties.All(property => source.Properties.TryGetValue(property.Key, out var value) && IsAssignable(value, property.Value));
    }

    static bool ArrayAssignable(ResponseValueType source, ResponseValueType target)
    {
        if (source.Item is null || target.Item is null) return false;
        return IsAssignable(source.Item, target.Item);
    }

    static IReadOnlyDictionary<string, ResponseValueType>? ObjectProperties(ResponseValueType type) => type.Kind == "object" ? type.Properties : null;

    static ResponseValueType? MemberType(ResponseValueType type, string segment)
    {
        if (!ValidMemberName(segment)) return null;
        return ObjectProperties(type)?.GetValueOrDefault(segment);
    }

    static bool ValidMemberName(string segment) => MemberName().IsMatch(segment) && !ProhibitedMember(segment);
    static bool ProhibitedMember(string segment) => segment == "constructor" || segment == "prototype" || segment == "__proto__";

    [GeneratedRegex("^[A-Za-z_][A-Za-z0-9_]*$", RegexOptions.CultureInvariant, 1000)]
    private static partial Regex MemberName();
}
